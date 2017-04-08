// MIT License - See https://github.com/AddedInnovation/nf-toolkit-chrome-extension/blob/master/LICENSE for details
// Copyright (c) 2017 Added Innovation LLC

/*********** Add your information here ***********/
var xWebUserName = ''; //Add your xWeb username here
var xWebPassword = ''; //Add your xWeb password here
var xWebUrl = 'http://___-ec2.amazonaws.com/xweb/secure/netforumxml.asmx'; //Add your fully qualified xWeb path here
/*********** End add your information here ***********/

//run this code on page load //TODO: test this with AJAX pageLoad()
window.addEventListener("load", myMain, false);

//main entry point here
function myMain() {
    //Add the "Adding Innovation" button to the page to allow extension to be turned off temporarily
    AddOnOffButtonToPage();
    //If extension is turned off, don't run code
    if (extensionOn() === "false")
    {
        return;
    }
    //Go get the currently running url on the currently active tab
    getCurrentTabUrl(function (url) {
        //Go get the xWeb url specified at the top of the file
        var xWebUrl = GetXWebUrl();
        //Go get an xWeb token out of cache or via xWeb Authentication method
        GetToken(function (token) {
            //Go get the current Form Key from the URL - note: the page may not always have a form key such as Wizards //TODO: Add Wizard Support
            var formKey = GetFormKey(url);
            if (formKey === null) {
                console.debug("No FormKey found");
                return;
            }
            //Check to see if we're on a profile form - special form key handling needed
            var isProfileForm = url.indexOf('DynamicProfile.aspx') > -1;
            //Call out to xWeb ExecuteMethod to get our form data back
            ExecuteMethod(xWebUrl, token, formKey, isProfileForm
                , function (data) { //onSuccess
                    //Wire up all the magic to show the info for each form control when you hover over it
                    ShowInfoOnHover(data, isProfileForm);
                }
            , function (response) { //onFailure
                // Handle cases where the currently saved token is no longer valid or the token has timed out.
                if (response.toJSON().Body.Fault.detail.InvalidTokenException) {
                    //clear the cached token
                    localStorage.removeItem('AuthorizationToken');
                    //start all over again //TODO: let's be more efficient about this in the future
                    myMain();
                }
                else {
                    console.debug(response.toString());
                }
            });
        }, function (errorResponseJSON) {
            console.debug(errorResponseJSON.toString());
        });
    });

    function getCurrentTabUrl(callback) {
        var url = window.location.href
        callback(url);
    }
    //Call out to xWeb ExecuteMethod method to grab form data
    function ExecuteMethod(xWebUrl, token, formKey, isProfileForm, successCallback, errorCallback) {
        jQuery.soap({
            url: xWebUrl,
            method: 'ns:ExecuteMethod',
            envAttributes: {
                'xmlns:ns': 'http://www.avectra.com/2005/'
            },
            appendMethodToURL: false,
            SOAPHeader: {
                'ns:AuthorizationToken': {
                    'ns:Token': token
                }
            },
            SOAPAction: 'http://www.avectra.com/2005/ExecuteMethod',
            data: {
                'ns:serviceName': 'AddedInnovation.ChromeExtension',
                'ns:methodName': getExecuteMethodName(isProfileForm),
                'ns:parameters': {
                    'ns:Parameter': {
                        'ns:Name': 'FormKey',
                        'ns:Value': formKey
                    }
                }
            },

            success: function (soapResponse) {
                successCallback(soapResponse.toJSON());
            },
            error: function (soapResponse) {
                // show error
                errorCallback(soapResponse);
            }
        });
    }
    function GetXWebUrl() {
        return xWebUrl;
    }
    //Get xWeb token from local browser cache or get a new one from xWeb
    function GetToken(successCallback, errorCallback) {
        var authorizationToken = localStorage.getItem('AuthorizationToken');
        if (authorizationToken && (typeof authorizationToken === 'string' || authorizationToken instanceof String) && isGuid(authorizationToken)) {
            successCallback(authorizationToken);
        }
        else {
            Authenticate(GetXWebUrl(), function (token, response) {
                localStorage.setItem('AuthorizationToken', token);
                successCallback(token);
            }, function (response) {
                errorCallback(response.toJSON());
            });
        }
    }
    function GetFormKey(url) {
        return getParameterByName("FormKey", url);
    }
    function getParameterByName(name, url) { //http://stackoverflow.com/a/901144/575278
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    //The magic that shows all the form control data 
    function ShowInfoOnHover(data, isProfileForm) {
        var controls = data.Body.ExecuteMethodResponse.ExecuteMethodResult.Controls.Control;
        for (var i = 0; i < controls.length; i++) {
            var control = controls[i];
            var controlName = control.dys_control_name;
            //Handle special profile form prefix magic strings
            var profileFormPrefix = '';
            if (isProfileForm) {
                profileFormPrefix = 'F1_';
            }
            // Find the controls on the page - handle automatically created Caption controls
            var $control = $('#' + profileFormPrefix + $.escapeSelector(controlName) + ', #Caption_' + profileFormPrefix + $.escapeSelector(controlName)); //https://api.jquery.com/jQuery.escapeSelector/
            //add class for green border on hover
            $control.addClass('ai-toolkit-extension-control');
            var title = getTitleText(control);
            //set attributes on control for bootstrap popover magic
            $control.attr('data-original-title', title); //https://github.com/twbs/bootstrap/issues/14769
            $control.attr('title', title);
            $control.attr('data-content', getContentText(control));
            $control.popover({
                placement: 'right',
                trigger: 'hover focus',
                //we are adding html to the data-content attribute, have to tell popover that or it will encode
                html: true,
                //add special template to support bootstrap forms
                template: '<div class="popover ai-toolkit-extension-control-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="row"><div class="form-horizontal popover-content"></div></div></div>'
            });
        }
    }
    function getTitleText(control) {
        var tooltipText = control.dys_control_name;
        if (control.dyx_control_id !== undefined) { //if we have a dyx_control_id, we have an extension - there is a left join in the ExecuteMethod SPROC
            tooltipText = 'Extension: ' + tooltipText;
        }
        return tooltipText;
    }
    function getContentText(control) {
        var tooltipText = '';
        //build out the bootstrap form-horizontal rows http://getbootstrap.com/css/#forms-horizontal
        for (var key in control) {
            if (control.hasOwnProperty(key) && key !== "dys_control_name") {
                tooltipText += "<div class='form-group'><label class='col-sm-3 col-md-3 col-lg-3 control-label'>" + key
                    + "</label><div class='col-sm-9 col-md-9 col-lg-9'><p class='form-control-static'>" + control[key] + "</p></div></div>"
            }
        }
        return tooltipText;
    }
    function getExecuteMethodName(isProfileForm) {
        //We use a different SPROC (and ExecuteMethod call) based on if it is a profile form since it has different logic. Could migrate this back into one.
        if (isProfileForm) {
            return 'GetProfileFormControlData';
        }
        else {
            return 'GetFormControlData';
        }
    }
    //Call xWeb Authenticate Method to get an Authorization Token back based on xWeb Url, username and password
    function Authenticate(xWebUrl, successCallback, errorCallback) {
        jQuery.soap({
            url: xWebUrl,
            method: 'ns:Authenticate',
            envAttributes: {
                'xmlns:ns': 'http://www.avectra.com/2005/'
            },
            appendMethodToURL: false,
            SOAPAction: 'http://www.avectra.com/2005/Authenticate',
            data: {
                'ns:userName': xWebUserName,
                'ns:password': xWebPassword
            },

            success: function (soapResponse) {
                var reponseJSON = soapResponse.toJSON();
                successCallback(reponseJSON.Header.AuthorizationToken.Token, reponseJSON);
            },
            error: function (soapResponse) {
                // show error
                errorCallback(soapResponse);
            }
        });
    }
    //your basic Guid check found on StackOverflow
    function isGuid(value) {
        var pattern = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
        if (pattern.test(value)) {
            return true;
        }
        else {
            return false;
        }
    }
    //Show On/Off button on page
    function AddOnOffButtonToPage() {
        // create title text based on if extension is on or not
        var title = "Not Adding Innovation";
        if (extensionOn() === "true") {
            title = "Adding Innovation";
        }
        //create a new input button
        var $onOffButton = $('<input id="extension-on-off" class="extension-on-off btn btn-default" type="button" value="' + title + '" />');
        //add it to the page
        $("body").append($onOffButton);
        //wire up a click event
        $onOffButton.click(function () {
            //check if extension is on
            if (extensionOn() === "true") {
                //turn off extension
                localStorage.setItem('AI-ExtensionOn', false);
            }
            else {
                //turn on extension
                localStorage.setItem('AI-ExtensionOn', true);
            }
            //reload the current page so we can apply the on/off status
            location.reload(false);
        });
    }
    //checks to see if extension is on - it's on by default after installation/cache clear
    function extensionOn() {
        var extensionOn = localStorage.getItem('AI-ExtensionOn');
        if (extensionOn === null) {
            localStorage.setItem('AI-ExtensionOn', true);
            return true;
        }
        else {
            return extensionOn;
        }
    }
}


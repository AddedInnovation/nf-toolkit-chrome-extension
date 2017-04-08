// MIT License - See https://github.com/AddedInnovation/nf-toolkit-chrome-extension/blob/master/LICENSE for details
// Copyright (c) 2017 Added Innovation LLC

/*********** Add your information here ***********/
var xWebUserName = ''; //Add your xWeb username here
var xWebPassword = ''; //Add your xWeb password here
var xWebUrl = 'http://___-ec2.amazonaws.com/xweb/secure/netforumxml.asmx'; //Add your fully qualified xWeb path here
/*********** End add your information here ***********/


window.addEventListener("load", myMain, false);
function myMain() {
    AddOnOffButtonToPage();
    if (extensionOn() === "false")
    {
        return;
    }
    getCurrentTabUrl(function (url) {
        var xWebUrl = GetXWebUrl();
        GetToken(function (token) {
            var formKey = GetFormKey(url);
            if (formKey === null) {
                console.debug("No FormKey found");
                return;
            }
            var isProfileForm = url.indexOf('DynamicProfile.aspx') > -1;
            ExecuteMethod(xWebUrl, token, formKey, isProfileForm
                , function (data) {
                    ShowInfoOnHover(data, isProfileForm);
                }
            , function (response) {
                if (response.toJSON().Body.Fault.detail.InvalidTokenException) {
                    localStorage.removeItem('AuthorizationToken');
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
    function GetToken(successCallback, errorCallback) {
        var authorizationToken = localStorage.getItem('AuthorizationToken');
        if (authorizationToken && (typeof authorizationToken === 'string' || authorizationToken instanceof String) && isGuid(authorizationToken)) {
            successCallback(authorizationToken);
        }
        else {
            Authorization(GetXWebUrl(), function (token, response) {
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
    function ShowInfoOnHover(data, isProfileForm) {
        var controls = data.Body.ExecuteMethodResponse.ExecuteMethodResult.Controls.Control;
        for (var i = 0; i < controls.length; i++) {
            var control = controls[i];
            var controlName = control.dys_control_name;
            var profileFormPrefix = '';
            if (isProfileForm) {
                profileFormPrefix = 'F1_';
            }
            var $control = $('#' + profileFormPrefix + $.escapeSelector(controlName) + ', #Caption_' + profileFormPrefix + $.escapeSelector(controlName)); //https://api.jquery.com/jQuery.escapeSelector/
            $control.addClass('ai-toolkit-extension-control');
            var title = getTitleText(control);
            $control.attr('data-original-title', title); //https://github.com/twbs/bootstrap/issues/14769
            $control.attr('title', title);
            $control.attr('data-content', getContentText(control));
            $control.popover({
                placement: 'right',
                //container: 'body', //http://stackoverflow.com/a/25326809/575278
                trigger: 'hover focus',
                html: true,
                template: '<div class="popover ai-toolkit-extension-control-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="row"><div class="form-horizontal popover-content"></div></div></div>'
            });
        }
    }
    function getTitleText(control) {
        var tooltipText = control.dys_control_name;
        if (control.dyx_control_id !== undefined) {
            tooltipText = 'Extension: ' + tooltipText;
        }
        return tooltipText;
    }
    function getContentText(control) {
        var tooltipText = '';// '<div class="row">';
        for (var key in control) {
            if (control.hasOwnProperty(key) && key !== "dys_control_name") {
                tooltipText += "<div class='form-group'><label class='col-sm-3 col-md-3 col-lg-3 control-label'>" + key
                    + "</label><div class='col-sm-9 col-md-9 col-lg-9'><p class='form-control-static'>" + control[key] + "</p></div></div>"
                //tooltipText += "<br />" + key + ": " + control[key];
            }
        }
        //tooltipText += '</div>';
        return tooltipText;
    }
    function getExecuteMethodName(isProfileForm) {
        if (isProfileForm) {
            return 'GetProfileFormControlData';
        }
        else {
            return 'GetFormControlData';
        }
        function GetTokenFromAuthorization() {

        }
    }
    function Authorization(xWebUrl, successCallback, errorCallback) {
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
    function isGuid(value) {
        var pattern = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
        if (pattern.test(value)) {
            return true;
        }
        else {
            return false;
        }
    }
    function AddOnOffButtonToPage() {
        var title = "Not Adding Innovation";
        if (extensionOn() === "true") {
            title = "Adding Innovation";
        }
        var $onOffButton = $('<input id="extension-on-off" class="extension-on-off btn btn-default" type="button" value="' + title + '" />');
        $("body").append($onOffButton);
        $onOffButton.click(function () {
            if (extensionOn() === "true") {
                localStorage.setItem('AI-ExtensionOn', false);
            }
            else {
                localStorage.setItem('AI-ExtensionOn', true);
            }
            location.reload(false);
        });
    }
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


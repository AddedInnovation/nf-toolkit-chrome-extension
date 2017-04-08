IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'AddedInnovationChromeExtensionGetProfileFormControlData')
DROP PROCEDURE [dbo].[AddedInnovationChromeExtensionGetProfileFormControlData]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		David Schlum | Added Innovation
-- Create date: 4/7/2017
-- Description:	Retrieves form control data based on form key for Chrome Extension
-- License:   Copyright (c) 2017 Added Innovation LLC - MIT License - See https://github.com/AddedInnovation/nf-toolkit-chrome-extension/blob/master/LICENSE for details
CREATE PROCEDURE [dbo].[AddedInnovationChromeExtensionGetProfileFormControlData]
	@FormKey uniqueidentifier
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    SELECT md_dynamic_form_control.*, obj_name, obj_key, dyn_description, dyn_designed, md_dynamic_form_extension.*
	FROM md_dynamic_profile_detail (NOLOCK)
		JOIN md_dynamic_form (NOLOCK) ON dpd_content_form_key = dyn_key
		JOIN md_dynamic_form_control (NOLOCK) ON dyn_key = dys_dyn_key
		   JOIN md_object (NOLOCK)
		   on obj_key = dyn_obj_key
			LEFT JOIN md_dynamic_form_extension (NOLOCK) ON ((dyn_key = dyx_dyn_key AND dys_control_name = dyx_control_id) OR (dyn_obj_key = dyx_obj_key AND dys_control_name = dyx_control_id)) AND dyx_delete_flag = 0
		  WHERE dpd_dyn_key = @FormKey
			AND dyn_delete_flag = 0
			AND dys_delete_flag = 0
			AND obj_delete_flag = 0 
			AND dpd_dyp_key IS NULL 
			AND dpd_delete_flag = 0 AND dpd_type='Form'
	  FOR XML RAW ('Control'), ROOT('Controls'), ELEMENTS 
END

GO



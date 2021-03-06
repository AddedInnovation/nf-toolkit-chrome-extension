/*
Run this script on your database to install 
Important: You can only run this once.
*/
		
SET NUMERIC_ROUNDABORT OFF
GO
SET ANSI_PADDING, ANSI_WARNINGS, CONCAT_NULL_YIELDS_NULL, ARITHABORT, QUOTED_IDENTIFIER, ANSI_NULLS, NOCOUNT ON
GO
SET DATEFORMAT YMD
GO
SET XACT_ABORT ON
GO
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
GO
BEGIN TRANSACTION
-- Pointer used for text / image updates. This might not be needed, but is declared here just in case
DECLARE @pv binary(16)

PRINT(N'Drop constraints from [dbo].[ws_web_service_method_node]')
ALTER TABLE [dbo].[ws_web_service_method_node] NOCHECK CONSTRAINT [FK_ws_web_service_method_node_ws_web_service_method]
ALTER TABLE [dbo].[ws_web_service_method_node] NOCHECK CONSTRAINT [FK_ws_web_service_method_node_ws_web_service_method_node_parent]

PRINT(N'Drop constraints from [dbo].[ws_web_service_method]')
ALTER TABLE [dbo].[ws_web_service_method] NOCHECK CONSTRAINT [FK_ws_web_service_method_ws_web_service]

PRINT(N'Drop constraint FK_ws_web_service_method_server_ws_web_service_method from [dbo].[ws_web_service_method_server]')
ALTER TABLE [dbo].[ws_web_service_method_server] NOCHECK CONSTRAINT [FK_ws_web_service_method_server_ws_web_service_method]

PRINT(N'Add row to [dbo].[ws_web_service]')
INSERT INTO [dbo].[ws_web_service] ([wxs_key], [wxs_service_name], [wxs_namespace], [wxs_add_user], [wxs_add_date], [wxs_change_user], [wxs_change_date], [wxs_delete_flag], [wxs_entity_key]) VALUES ('f57d8b1f-8dc3-407a-b413-3f4a0b6d44c1', N'AddedInnovation.ChromeExtension', N'AddedInnovation.Chrome', N'dschlum', '2017-04-06 03:34:22.000', NULL, NULL, 0, NULL)

PRINT(N'Add rows to [dbo].[ws_web_service_method]')
INSERT INTO [dbo].[ws_web_service_method] ([wxm_key], [wxm_web_method], [wxm_wxs_key], [wxm_notes], [wxm_allow_anonymous_access_flag], [wxm_add_user], [wxm_add_date], [wxm_change_user], [wxm_change_date], [wxm_delete_flag], [wxm_entity_key]) VALUES ('3c840091-f732-433e-8bf2-00414833e21d', N'GetFormControlData', 'f57d8b1f-8dc3-407a-b413-3f4a0b6d44c1', NULL, 1, N'dschlum', '2017-04-06 03:35:00.000', N'dschlum', '2017-04-06 03:50:43.000', 0, NULL)
INSERT INTO [dbo].[ws_web_service_method] ([wxm_key], [wxm_web_method], [wxm_wxs_key], [wxm_notes], [wxm_allow_anonymous_access_flag], [wxm_add_user], [wxm_add_date], [wxm_change_user], [wxm_change_date], [wxm_delete_flag], [wxm_entity_key]) VALUES ('3420dc6e-62a6-4b4e-831d-5202b1b0be3a', N'GetProfileFormControlData ', 'f57d8b1f-8dc3-407a-b413-3f4a0b6d44c1', NULL, 1, N'dschlum', '2017-04-06 10:17:30.000', N'dschlum', '2017-04-07 23:17:28.000', 0, NULL)
PRINT(N'Operation applied to 2 rows out of 2')

PRINT(N'Add rows to [dbo].[ws_web_service_method_node]')
INSERT INTO [dbo].[ws_web_service_method_node] ([wxn_key], [wxn_node], [wxn_wxm_key], [wxn_parent_wxn_key], [wxn_sql], [wxn_order], [wxn_add_user], [wxn_add_date], [wxn_change_user], [wxn_change_date], [wxn_delete_flag], [wxn_entity_key]) VALUES ('45a1b99b-acec-4cd5-9baa-02592843405f', N'xml', '3c840091-f732-433e-8bf2-00414833e21d', NULL, N'exec dbo.AddedInnovationChromeExtensionGetFormControlData @FormKey={FormKey}', 10, N'dschlum', '2017-04-06 03:36:07.000', N'dschlum', '2017-04-06 03:51:10.000', 0, NULL)
INSERT INTO [dbo].[ws_web_service_method_node] ([wxn_key], [wxn_node], [wxn_wxm_key], [wxn_parent_wxn_key], [wxn_sql], [wxn_order], [wxn_add_user], [wxn_add_date], [wxn_change_user], [wxn_change_date], [wxn_delete_flag], [wxn_entity_key]) VALUES ('e2fc7bb8-2c19-4a49-b9ed-40095904c40c', N'xml', '3420dc6e-62a6-4b4e-831d-5202b1b0be3a', NULL, N'exec dbo.AddedInnovationChromeExtensionGetProfileFormControlData @FormKey={FormKey}', 10, N'dschlum', '2017-04-06 10:18:05.000', NULL, NULL, 0, NULL)
PRINT(N'Operation applied to 2 rows out of 2')

PRINT(N'Add constraints to [dbo].[ws_web_service_method_node]')
ALTER TABLE [dbo].[ws_web_service_method_node] CHECK CONSTRAINT [FK_ws_web_service_method_node_ws_web_service_method]
ALTER TABLE [dbo].[ws_web_service_method_node] CHECK CONSTRAINT [FK_ws_web_service_method_node_ws_web_service_method_node_parent]

PRINT(N'Add constraints to [dbo].[ws_web_service_method]')
ALTER TABLE [dbo].[ws_web_service_method] CHECK CONSTRAINT [FK_ws_web_service_method_ws_web_service]
ALTER TABLE [dbo].[ws_web_service_method_server] CHECK CONSTRAINT [FK_ws_web_service_method_server_ws_web_service_method]
COMMIT TRANSACTION
GO

CREATE DATABASE collector
GO

CREATE DATABASE staging
GO

USE [collector]
GO
/****** Object:  Table [dbo].[datasources]    Script Date: 10/18/2022 12:25:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[datasources](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [varchar](max) NOT NULL,
	[is_active] [bit] NULL,
	[is_lookup] [bit] NOT NULL,
	[created_at] [datetime] NULL,
 CONSTRAINT [PK__datasources] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tasks]    Script Date: 10/18/2022 12:25:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tasks](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[datasource_id] [int] NOT NULL,
	[run_date] [datetime] NULL,
	[is_completed] [bit] NULL,
	[table_name] [varchar](max) NULL,
	[file_path] [varchar](max) NULL,
	[extracted_quantity] [int] NOT NULL,
	[stored_quantity] [int] NOT NULL,
	[is_processed] [bit] NOT NULL,
	[is_archived] [bit] NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
 CONSTRAINT [PK__tasks] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[datasources] ADD  CONSTRAINT [DF__reports__is_acti__49C3F6B7]  DEFAULT ((0)) FOR [is_active]
GO
ALTER TABLE [dbo].[datasources] ADD  CONSTRAINT [DF_datasources_is_lookup]  DEFAULT ((0)) FOR [is_lookup]
GO
ALTER TABLE [dbo].[datasources] ADD  CONSTRAINT [DF__reports__created__4AB81AF0]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[tasks] ADD  CONSTRAINT [DF__tasks__extracted__4BAC3F29]  DEFAULT ((0)) FOR [extracted_quantity]
GO
ALTER TABLE [dbo].[tasks] ADD  CONSTRAINT [DF__tasks__stored_qu__4CA06362]  DEFAULT ((0)) FOR [stored_quantity]
GO
ALTER TABLE [dbo].[tasks] ADD  CONSTRAINT [DF__tasks__is_proces__4D94879B]  DEFAULT ((0)) FOR [is_processed]
GO
ALTER TABLE [dbo].[tasks] ADD  CONSTRAINT [DF_tasks_is_archived]  DEFAULT ((0)) FOR [is_archived]
GO
ALTER TABLE [dbo].[tasks] ADD  CONSTRAINT [DF__tasks__created_a__4E88ABD4]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[tasks] ADD  CONSTRAINT [DF__tasks__updated_a__4F7CD00D]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[tasks]  WITH CHECK ADD  CONSTRAINT [FK__tasks__report_id] FOREIGN KEY([datasource_id])
REFERENCES [dbo].[datasources] ([id])
GO
ALTER TABLE [dbo].[tasks] CHECK CONSTRAINT [FK__tasks__report_id]
GO
/****** Object:  StoredProcedure [dbo].[sp_insertTasks]    Script Date: 10/18/2022 12:25:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,WP>
-- Create date: <Create Date,9/21/2022>
-- Description:	<Description>
-- =============================================
CREATE PROCEDURE [dbo].[sp_insertTasks]
	-- Add the parameters for the stored procedure here
	@TableName as VARCHAR(50),@ColumnParam1 AS VARCHAR(max),@ColumnParam2 AS VARCHAR(max),@ColumnParam3 AS VARCHAR(max),@ColumnParam4 AS VARCHAR(max)

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE @TableName1 varchar(100) 
	DECLARE @sql NVARCHAR(max)
	DECLARE @ColumnParameter1 varchar(max)
	DECLARE @ColumnParameter2 varchar(max)
	DECLARE @ColumnParameter3 varchar(max)
	DECLARE @ColumnParameter4 varchar(max)
	
	SET @TableName1 = REPLACE(@TableName,'SELECT','');
	SET @TableName1 = REPLACE(@TableName1,'INSERT','');
	SET @TableName1 = REPLACE(@TableName1,'CREATE','');
	SET @TableName1 = REPLACE(@TableName1,'DELETE','');
	SET @TableName1 = REPLACE(@TableName1,'UPDATE','');
	SET @TableName1 = REPLACE(@TableName1,'DROP','');
	SET @TableName1 = REPLACE(@TableName1,'EXEC','');

	SET @ColumnParameter1 = REPLACE(@ColumnParam1,'SELECT','');
	SET @ColumnParameter1 = REPLACE(@ColumnParameter1,'INSERT','');
	SET @ColumnParameter1 = REPLACE(@ColumnParameter1,'CREATE','');
	SET @ColumnParameter1 = REPLACE(@ColumnParameter1,'DELETE','');
	SET @ColumnParameter1 = REPLACE(@ColumnParameter1,'UPDATE','');
	SET @ColumnParameter1 = REPLACE(@ColumnParameter1,'DROP','');
	SET @ColumnParameter1 = REPLACE(@ColumnParameter1,'EXEC','');
	
	SET @ColumnParameter2 = REPLACE(@ColumnParam2,'SELECT','');
	SET @ColumnParameter2 = REPLACE(@ColumnParameter2,'INSERT','');
	SET @ColumnParameter2 = REPLACE(@ColumnParameter2,'CREATE','');
	SET @ColumnParameter2 = REPLACE(@ColumnParameter2,'DELETE','');
	SET @ColumnParameter2 = REPLACE(@ColumnParameter2,'UPDATE','');
	SET @ColumnParameter2 = REPLACE(@ColumnParameter2,'DROP','');
	SET @ColumnParameter2 = REPLACE(@ColumnParameter2,'EXEC','');

	SET @ColumnParameter3 = REPLACE(@ColumnParam3,'SELECT','');
	SET @ColumnParameter3 = REPLACE(@ColumnParameter3,'INSERT','');
	SET @ColumnParameter3 = REPLACE(@ColumnParameter3,'CREATE','');
	SET @ColumnParameter3 = REPLACE(@ColumnParameter3,'DELETE','');
	SET @ColumnParameter3 = REPLACE(@ColumnParameter3,'UPDATE','');
	SET @ColumnParameter3 = REPLACE(@ColumnParameter3,'DROP','');
	SET @ColumnParameter3 = REPLACE(@ColumnParameter3,'EXEC','');

	SET @ColumnParameter4 = REPLACE(@ColumnParam4,'SELECT','');
	SET @ColumnParameter4 = REPLACE(@ColumnParameter4,'INSERT','');
	SET @ColumnParameter4 = REPLACE(@ColumnParameter4,'CREATE','');
	SET @ColumnParameter4 = REPLACE(@ColumnParameter4,'DELETE','');
	SET @ColumnParameter4 = REPLACE(@ColumnParameter4,'UPDATE','');
	SET @ColumnParameter4 = REPLACE(@ColumnParameter4,'DROP','');
	SET @ColumnParameter4 = REPLACE(@ColumnParameter4,'EXEC','');

	BEGIN
		IF NOT EXISTS (SELECT 1 from datacollector_db.dbo.tasks where file_path = @ColumnParameter3 and datasource_id = (SELECT id FROM datacollector_db.dbo.datasources where name = @ColumnParameter1 and (is_active = 1 or is_lookup = 1 )))            
            BEGIN               
                INSERT INTO datacollector_db.dbo.tasks(datasource_id,run_date,is_completed,file_path,extracted_quantity)                 
                    VALUES((SELECT id FROM datacollector_db.dbo.datasources where name = @ColumnParameter1 and (is_active = 1 or is_lookup = 1)), @ColumnParameter2,1,@ColumnParameter3,@ColumnParameter4)            
            END  
	END
	--EXEC sp_executesql @sql;	
END
GO

SET IDENTITY_INSERT [dbo].[datasources] ON 
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (1, N'AGENT_INTERACTION_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (2, N'AGENT_PERFORMANCE_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:16:51.173' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (3, N'AGENT_QUEUE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:16:54.750' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (4, N'AGENT_STATUS_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:16:58.733' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (5, N'INTERACTION_SEARCH_VIEW', 1, CAST(N'2022-09-21T16:17:03.020' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (6, N'QUEUE_INTERACTION_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:17:07.557' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (7, N'QUEUE_PERFORMANCE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:17:11.937' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (8, N'QUEUE_PERFORMANCE_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:17:15.720' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (9, N'SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:17:20.243' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (10, N'ABANDON_INSIGHTS_VIEW', 1, CAST(N'2022-09-21T16:17:25.867' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (11, N'AGENT_DEVELOPMENT_DETAIL_ME_VIEW', 1, CAST(N'2022-09-21T16:17:30.737' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (12, N'AGENT_DEVELOPMENT_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:17:35.440' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (13, N'AGENT_DEVELOPMENT_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:17:39.420' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (14, N'AGENT_EVALUATION_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:17:43.887' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (15, N'AGENT_EVALUATION_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:17:48.013' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (16, N'AGENT_PERFORMANCE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:17:51.767' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (17, N'AGENT_STATUS_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:17:55.620' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (18, N'AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:17:59.790' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (19, N'AGENT_WRAP_UP_PERFORMANCE_INTERVAL_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:18:05.353' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (20, N'BOT_PERFORMANCE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:18:09.020' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (21, N'BOT_PERFORMANCE_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:18:12.800' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (22, N'CONTENT_SEARCH_VIEW', 1, CAST(N'2022-09-21T16:18:16.680' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (23, N'DNIS_PERFORMANCE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:18:20.420' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (24, N'DNIS_PERFORMANCE_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:18:24.220' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (25, N'FLOW_DESTINATION_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:18:27.350' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (26, N'FLOW_MILESTONE_PERFORMANCE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:18:30.860' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (27, N'FLOW_MILESTONE_PERFORMANCE_INTERVAL_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:18:34.390' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (28, N'FLOW_OUTCOME_PERFORMANCE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:18:38.137' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (29, N'FLOW_OUTCOME_PERFORMANCE_INTERVAL_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:18:41.887' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (30, N'FLOW_OUTCOME_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:18:45.177' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (31, N'IVR_PERFORMANCE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:18:49.260' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (32, N'IVR_PERFORMANCE_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:18:52.863' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (33, N'JOURNEY_ACTION_MAP_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:18:56.740' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (34, N'JOURNEY_OUTCOME_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:19:01.617' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (35, N'JOURNEY_SEGMENT_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:19:05.383' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (36, N'QUEUE_AGENT_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:19:09.360' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (37, N'SCHEDULED_CALLBACKS_VIEW', 1, CAST(N'2022-09-21T16:19:13.423' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (38, N'SKILLS_PERFORMANCE_VIEW', 1, CAST(N'2022-09-21T16:19:16.907' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (39, N'SURVEY_FORM_PERFORMANCE_DETAIL_VIEW', 1, CAST(N'2022-09-21T16:19:20.930' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (40, N'WRAP_UP_PERFORMANCE_SUMMARY_VIEW', 1, CAST(N'2022-09-21T16:19:24.787' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (41, N'AGENT_PRESENCE_CONFIG_DEFINITIONS', 1, CAST(N'2022-09-21T16:19:24.787' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_active], [created_at]) VALUES (42, N'AGENT_CUSTOM_BREAK_VIEW', 1, CAST(N'2022-09-21T16:19:24.787' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_lookup], [created_at]) VALUES (43, N'DID_LOOKUP', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_lookup], [created_at]) VALUES (44, N'FLOW_LOOKUP', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_lookup], [created_at]) VALUES (45, N'FLOWMILESTONE_LOOKUP', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_lookup], [created_at]) VALUES (46, N'FLOWOUTCOME_LOOKUP', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_lookup], [created_at]) VALUES (47, N'MEDIATYPES_LOOKUP', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_lookup], [created_at]) VALUES (48, N'QUEUE_ID_LOOKUP', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_lookup], [created_at]) VALUES (49, N'SURVEY_LOOKUP', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_lookup], [created_at]) VALUES (50, N'USERID_LOOKUP', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
INSERT [dbo].[datasources] ([id], [name], [is_lookup], [created_at]) VALUES (51, N'WRAPUP_LOOKUP', 1, CAST(N'2022-09-21T16:16:40.080' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[datasources] OFF
GO
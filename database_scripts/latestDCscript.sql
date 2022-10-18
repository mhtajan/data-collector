USE [datacollector_db]
GO
/****** Object:  Table [dbo].[datasources]    Script Date: 18/10/2022 3:56:25 pm ******/
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
 CONSTRAINT [PK__reports__3213E83F8ABEFDE5] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[downloads]    Script Date: 18/10/2022 3:56:25 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[downloads](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[exports_id] [bigint] NULL,
	[datasource_name] [varchar](max) NOT NULL,
	[report_name] [varchar](max) NOT NULL,
	[url] [varchar](max) NOT NULL,
	[is_failed] [bit] NOT NULL,
	[is_completed] [bit] NOT NULL,
	[remarks] [varchar](max) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
 CONSTRAINT [PK_downloads] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[exports]    Script Date: 18/10/2022 3:56:25 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[exports](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[datasource_id] [int] NOT NULL,
	[datasource_name] [varchar](max) NOT NULL,
	[report_name] [varchar](max) NOT NULL,
	[payload] [varchar](max) NOT NULL,
	[is_exported] [bit] NOT NULL,
	[is_completed] [bit] NOT NULL,
	[is_failed] [bit] NOT NULL,
	[export_retries] [int] NOT NULL,
	[generation_retries] [int] NOT NULL,
	[is_max_retry_reached] [bit] NOT NULL,
	[remarks] [varchar](max) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
 CONSTRAINT [PK_exports] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[status]    Script Date: 18/10/2022 3:56:25 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[status](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[run_id] [varchar](50) NOT NULL,
	[report_id] [varchar](50) NOT NULL,
	[status] [varchar](50) NOT NULL,
	[report_name] [varchar](max) NOT NULL,
	[is_deleted] [bit] NOT NULL,
 CONSTRAINT [PK_report_status] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tasks]    Script Date: 18/10/2022 3:56:25 pm ******/
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
 CONSTRAINT [PK__tasks__3213E83F6DE385BE] PRIMARY KEY CLUSTERED 
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
ALTER TABLE [dbo].[downloads] ADD  CONSTRAINT [DF_downloads_is_failed]  DEFAULT ((0)) FOR [is_failed]
GO
ALTER TABLE [dbo].[downloads] ADD  CONSTRAINT [DF_downloads_is_completed]  DEFAULT ((0)) FOR [is_completed]
GO
ALTER TABLE [dbo].[downloads] ADD  CONSTRAINT [DF_downloads_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[downloads] ADD  CONSTRAINT [DF_downloads_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[exports] ADD  CONSTRAINT [DF_exports_is_exported]  DEFAULT ((0)) FOR [is_exported]
GO
ALTER TABLE [dbo].[exports] ADD  CONSTRAINT [DF_exports_is_completed]  DEFAULT ((0)) FOR [is_completed]
GO
ALTER TABLE [dbo].[exports] ADD  CONSTRAINT [DF_exports_is_failed]  DEFAULT ((0)) FOR [is_failed]
GO
ALTER TABLE [dbo].[exports] ADD  CONSTRAINT [DF_exports_retries]  DEFAULT ((0)) FOR [export_retries]
GO
ALTER TABLE [dbo].[exports] ADD  CONSTRAINT [DF_exports_generation_retries]  DEFAULT ((0)) FOR [generation_retries]
GO
ALTER TABLE [dbo].[exports] ADD  CONSTRAINT [DF_exports_is_max_retry_reached]  DEFAULT ((0)) FOR [is_max_retry_reached]
GO
ALTER TABLE [dbo].[exports] ADD  CONSTRAINT [DF_exports_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[exports] ADD  CONSTRAINT [DF_exports_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[status] ADD  CONSTRAINT [DF_report_status_is_deleted]  DEFAULT ((0)) FOR [is_deleted]
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
ALTER TABLE [dbo].[tasks]  WITH CHECK ADD  CONSTRAINT [FK__tasks__report_id__5070F446] FOREIGN KEY([datasource_id])
REFERENCES [dbo].[datasources] ([id])
GO
ALTER TABLE [dbo].[tasks] CHECK CONSTRAINT [FK__tasks__report_id__5070F446]
GO
/****** Object:  StoredProcedure [dbo].[sp_insertDownload]    Script Date: 18/10/2022 3:56:25 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,MGT>
-- Create date: <Create Date,10/14/2022>
-- Description:	<Description>
-- =============================================
CREATE PROCEDURE [dbo].[sp_insertDownload]
	-- Add the parameters for the stored procedure here
	@TableName as VARCHAR(50),@ColumnParam1 AS VARCHAR(max),@ColumnParam2 AS VARCHAR(max),@ColumnParam3 AS VARCHAR(max)

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

	
	BEGIN        
		IF NOT EXISTS (SELECT 1 from datacollector_db.dbo.downloads where report_name = @ColumnParameter1 and url = @ColumnParameter2)            
			BEGIN               
				INSERT INTO datacollector_db.dbo.downloads(exports_id,report_name,url,datasource_name)                 
					VALUES((SELECT id FROM datacollector_db.dbo.exports where report_name = @ColumnParameter1), @ColumnParameter1,@ColumnParameter2,@ColumnParameter3)            
					END    
					END
	--EXEC sp_executesql @sql;	
END
GO
/****** Object:  StoredProcedure [dbo].[sp_insertExports]    Script Date: 18/10/2022 3:56:25 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,MGT>
-- Create date: <Create Date,10/14/2022>
-- Description:	<Description>
-- =============================================
CREATE PROCEDURE [dbo].[sp_insertExports]
	-- Add the parameters for the stored procedure here
	@TableName as VARCHAR(50),@ColumnParam1 AS VARCHAR(max),@ColumnParam2 AS VARCHAR(max),@ColumnParam3 AS VARCHAR(max)

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

	
	BEGIN        
		IF NOT EXISTS (SELECT 1 from datacollector_db.dbo.exports where payload = @ColumnParameter2 and datasource_id = (SELECT id FROM datacollector_db.dbo.datasources where name = @ColumnParameter1 and is_active = 1 ))            
			BEGIN               
				INSERT INTO datacollector_db.dbo.exports(datasource_id,payload,report_name,datasource_name)                 
					VALUES((SELECT id FROM datacollector_db.dbo.datasources where name = @ColumnParameter1 and is_active = 1), @ColumnParameter2,@ColumnParameter3,@ColumnParameter1)            
					END    
					END
	--EXEC sp_executesql @sql;	
END
GO
/****** Object:  StoredProcedure [dbo].[sp_insertStatus]    Script Date: 18/10/2022 3:56:25 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,WP>
-- Create date: <Create Date,9/21/2022>
-- Description:	<Description>
-- =============================================
CREATE PROCEDURE [dbo].[sp_insertStatus]
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
		IF NOT EXISTS (SELECT 1 from datacollector_db.dbo.status where run_id = @ColumnParameter1)            
			BEGIN               
				INSERT INTO datacollector_db.dbo.status(run_id,report_id,status,report_name)                 
					VALUES(@ColumnParameter1,@ColumnParameter2,@ColumnParameter3,@ColumnParameter4)            
					END    
					END
	--EXEC sp_executesql @sql;	
END
GO
/****** Object:  StoredProcedure [dbo].[sp_insertTasks]    Script Date: 18/10/2022 3:56:25 pm ******/
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

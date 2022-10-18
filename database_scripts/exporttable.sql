USE [datacollector_db]
GO

/****** Object:  Table [dbo].[exports]    Script Date: 14/10/2022 8:50:02 pm ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[exports](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[datasource_id] [int] NOT NULL,
	[payload] [nvarchar](max) NOT NULL,
	[is_exported] [bit] NOT NULL,
	[is_completed] [bit] NOT NULL,
	[is_failed] [bit] NOT NULL,
	[export_retries] [int] NOT NULL,
	[generation_retries] [int] NOT NULL,
	[is_max_retry_reached] [bit] NOT NULL,
	[remarks] [nvarchar](max) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
 CONSTRAINT [PK_exports] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
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



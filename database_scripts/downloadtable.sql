USE [datacollector_db]
GO

/****** Object:  Table [dbo].[downloads]    Script Date: 14/10/2022 8:49:28 pm ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[downloads](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[exports_id] [bigint] NOT NULL,
	[report_id] [varchar](50) NOT NULL,
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

ALTER TABLE [dbo].[downloads] ADD  CONSTRAINT [DF_downloads_created_at]  DEFAULT (getdate()) FOR [created_at]
GO

ALTER TABLE [dbo].[downloads] ADD  CONSTRAINT [DF_downloads_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO



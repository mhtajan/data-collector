USE [datacollector_db]
GO

/****** Object:  Table [dbo].[status]    Script Date: 16/10/2022 9:28:20 pm ******/
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

ALTER TABLE [dbo].[status] ADD  CONSTRAINT [DF_report_status_is_deleted]  DEFAULT ((0)) FOR [is_deleted]
GO



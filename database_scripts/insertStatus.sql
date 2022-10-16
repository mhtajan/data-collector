USE [datacollector_db]
GO
/****** Object:  StoredProcedure [dbo].[sp_insertStatus]    Script Date: 16/10/2022 9:28:56 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,WP>
-- Create date: <Create Date,9/21/2022>
-- Description:	<Description>
-- =============================================
ALTER PROCEDURE [dbo].[sp_insertStatus]
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

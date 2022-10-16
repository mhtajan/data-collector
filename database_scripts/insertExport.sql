USE [datacollector_db]
GO
/****** Object:  StoredProcedure [dbo].[sp_insertExports]    Script Date: 14/10/2022 8:41:58 pm ******/
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
	@TableName as VARCHAR(50),@ColumnParam1 AS VARCHAR(max),@ColumnParam2 AS VARCHAR(max)

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

	
	BEGIN        
		IF NOT EXISTS (SELECT 1 from datacollector_db.dbo.exports where payload = @ColumnParameter2 and datasource_id = (SELECT id FROM datacollector_db.dbo.datasources where name = @ColumnParameter1 and is_active = 1 ))            
			BEGIN               
				INSERT INTO datacollector_db.dbo.exports(datasource_id,payload)                 
					VALUES((SELECT id FROM datacollector_db.dbo.datasources where name = @ColumnParameter1 and is_active = 1), @ColumnParameter2)            
					END    
					END
	--EXEC sp_executesql @sql;	
END

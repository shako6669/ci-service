## Crear procedimiento almacenado para obtener los datos agrupados de CPU's

```sql
DELIMITER //

CREATE PROCEDURE pivot_results()
BEGIN
    -- Variables for dynamic SQL
    DECLARE done INT DEFAULT FALSE;
    DECLARE col_id VARCHAR(255);
    DECLARE col_name VARCHAR(255);
    DECLARE col_value VARCHAR(255);
    DECLARE query TEXT;
    DECLARE column_list TEXT DEFAULT '';

    -- Cursor to fetch all name-value pairs
    DECLARE cur CURSOR FOR
        select dis.idPadre, prop.nombre, sum(det.valor) valor
		from inv_detalle det inner join inv_dispositivo dis on det.DispositivoId = dis.id
		inner join inv_propiedad prop on det.PropiedadId = prop.id
		where prop.auto_suma = 1
		group by prop.nombre;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Start building the dynamic query
    SET query = 'SELECT ';

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO col_id, col_name, col_value;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Add each name as a column with its value
        SET column_list = CONCAT(column_list,
            IF(column_list = '', '', ', '),
            '''', col_value, ''' AS `', REPLACE(col_name, '`', '``'), '`');
    END LOOP;

    CLOSE cur;

    -- Complete and execute the query
    SET query = CONCAT(query, column_list);

    -- Prepare and execute the dynamic SQL
    -- SET @sql = query;
    SET @sql = CONCAT('
        SELECT p.*, a.tipo, a.marca, a.modelo, a.serie, a.cod_inventario
        FROM (',
            query,
        ') p
        JOIN (
			select dis.id as id, tip.nombre as tipo,  mar.nombre as marca, modelo.nombre as modelo, dis.serie, dis.cod_inventario
			from inv_dispositivo dis inner join inv_fabricante mar on dis.marcaId = mar.id
			inner join inv_fabricante modelo on dis.modeloId = modelo.id
			inner join inv_tipo tip on dis.tipoId = tip.id
			where dis.idPadre is null
        ) a ON p.id = a.id
    ');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;
```

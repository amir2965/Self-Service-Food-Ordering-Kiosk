-- ...existing code...

-- Create trigger for automatic points calculation
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_order_insert
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.member_id IS NOT NULL THEN
        -- Calculate points (1 point per dollar spent)
        SET @points_earned = FLOOR(NEW.final_total);
        
        -- Update user points
        UPDATE users 
        SET points = points + @points_earned
        WHERE id = NEW.member_id;
        
        -- Log points transaction
        INSERT INTO points_transactions (
            user_id,
            points_change,
            transaction_type,
            order_id,
            description
        ) VALUES (
            NEW.member_id,
            @points_earned,
            'earn',
            NEW.id,
            CONCAT('Points earned from order #', NEW.order_number)
        );
    END IF;
END//
DELIMITER ;

-- Add points_audit table for tracking points changes
CREATE TABLE IF NOT EXISTS points_audit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    points_before INT NOT NULL,
    points_after INT NOT NULL,
    points_change INT NOT NULL,
    change_type ENUM('earn', 'redeem', 'adjust', 'expire') NOT NULL,
    order_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Create trigger to audit points changes
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_points_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.points != NEW.points THEN
        INSERT INTO points_audit (
            user_id,
            points_before,
            points_after,
            points_change,
            change_type
        ) VALUES (
            NEW.id,
            OLD.points,
            NEW.points,
            NEW.points - OLD.points,
            CASE
                WHEN NEW.points > OLD.points THEN 'earn'
                ELSE 'redeem'
            END
        );
    END IF;
END//
DELIMITER ;

-- ...existing code...

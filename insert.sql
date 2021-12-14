CREATE TABLE [Feedback] (
    [id] VARCHAR(50) NOT NULL PRIMARY KEY,
    [user_id] VARCHAR(50),
    [product_id] VARCHAR(50) NOT NULL,
    [comment] VARCHAR(MAX) NOT NULL,
    [created_at] DATETIME NOT NULL DEFAULT(GETDATE()),
    [modified_at] DATETIME NOT NULL DEFAULT(GETDATE()),


    CONSTRAINT FK_feedback_product FOREIGN KEY ([product_id])
    REFERENCES [Product] ([id])
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

    CONSTRAINT FK_feedback_user FOREIGN KEY ([user_id])
    REFERENCES [User] ([id])
    ON DELETE SET NULL
    ON UPDATE NO ACTION
);
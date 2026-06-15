-- CreateIndex
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

-- CreateIndex
CREATE INDEX "Collection_userId_updatedAt_idx" ON "Collection"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "Item"("userId");

-- CreateIndex
CREATE INDEX "Item_userId_lastUsedAt_idx" ON "Item"("userId", "lastUsedAt");

-- CreateIndex
CREATE INDEX "Item_userId_isPinned_idx" ON "Item"("userId", "isPinned");

-- CreateIndex
CREATE INDEX "ItemCollection_collectionId_idx" ON "ItemCollection"("collectionId");

import Bring from 'bring-shopping';

export class BringClient {
  private bring = new Bring({ mail: process.env.BRING_MAIL!, password: process.env.BRING_PASSWORD! });
  private isLoggedIn = false;

  private async _login() {
    try {
      await this.bring.login();
      this.isLoggedIn = true;
    } catch (error) {
      this.isLoggedIn = false; // Ensure isLoggedIn is false if login fails
      // Re-throw the original error to be handled by the caller
      throw error;
    }
  }

  private async ensureLoggedIn() {
    if (!this.isLoggedIn) {
      await this._login();
    }
  }

  async loadLists() {
    await this.ensureLoggedIn();
    return this.bring.loadLists();
  }
  async getItems(listUuid: string) {
    await this.ensureLoggedIn();
    const listDetails = await this.bring.getItems(listUuid);

    // Define an interface for the item structure
    interface BringItem {
      name: string;
      specification: string;
      itemId?: string;
      // Add other potential properties if known
    }

    // Helper function to add itemId to items in an array
    const addItemIdToItems = (items: BringItem[]): BringItem[] => {
      if (Array.isArray(items)) {
        return items.map((item) => ({
          ...item,
          itemId: item.name, // Set itemId to be the same as name
        }));
      }
      return items; // Return original if not an array
    };

    // Add itemId to items in purchase and recently arrays
    if (listDetails && typeof listDetails === 'object') {
      // The bring.getItems() response type might not exactly match BringItem initially (e.g. missing itemId)
      // So, we cast to unknown first, then to BringItem[] for the transformation.
      // This acknowledges that we are intentionally reshaping the data.
      if (listDetails.purchase) {
        listDetails.purchase = addItemIdToItems(listDetails.purchase as unknown as BringItem[]);
      }
      if (listDetails.recently) {
        listDetails.recently = addItemIdToItems(listDetails.recently as unknown as BringItem[]);
      }
    }

    return listDetails;
  }
  async getItemsDetails(listUuid: string) {
    await this.ensureLoggedIn();
    return this.bring.getItemsDetails(listUuid);
  }
  async saveItem(listUuid: string, itemName: string, specification: string | null | undefined) {
    await this.ensureLoggedIn();
    return this.bring.saveItem(listUuid, itemName, specification || '');
  }
  async removeItem(listUuid: string, itemId: string) {
    await this.ensureLoggedIn();
    return this.bring.removeItem(listUuid, itemId);
  }
  async moveToRecentList(listUuid: string, itemId: string) {
    await this.ensureLoggedIn();
    return this.bring.moveToRecentList(listUuid, itemId);
  }

  /**
   * Saves an image for an item on a shopping list.
   * @param listUuid The UUID of the shopping list.
   * @param itemId The ID of the item.
   * @param imagePathOrUrl Local file path or URL of the image.
   * @returns A promise that resolves when the image has been saved.
   */
  async saveItemImage(listUuid: string, itemId: string, imagePathOrUrl: string): Promise<unknown> {
    await this.ensureLoggedIn();
    // Based on PR #221 in the bring-shopping library, this method expects listUuid, itemId, and a string for imagePathOrUrl.
    // The library is expected to handle whether this string is a local file path or a URL.
    // @ts-expect-error Type definitions for bring-shopping may be outdated. Signature based on PR #221.
    return this.bring.saveItemImage(listUuid, itemId, imagePathOrUrl);
  }

  /**
   * Removes an image from an item on a shopping list.
   * @param listUuid The UUID of the shopping list.
   * @param itemId The ID of the item.
   * @returns A promise that resolves when the image has been removed.
   */
  async removeItemImage(listUuid: string, itemId: string): Promise<unknown> {
    await this.ensureLoggedIn();
    // The bring-shopping library's changelog (v1.5.1) fixed this method, implying the signature (listUuid, itemId) is correct.
    // @ts-expect-error Type definitions for bring-shopping may be outdated. Signature based on changelog v1.5.1.
    return this.bring.removeItemImage(listUuid, itemId);
  }

  async getAllUsersFromList(listUuid: string) {
    await this.ensureLoggedIn();
    return this.bring.getAllUsersFromList(listUuid);
  }
  async getUserSettings() {
    await this.ensureLoggedIn();
    return this.bring.getUserSettings();
  }
  async loadTranslations(locale?: string) {
    await this.ensureLoggedIn();
    return this.bring.loadTranslations(locale || 'en-US');
  }
  async loadCatalog(locale: string) {
    await this.ensureLoggedIn();
    return this.bring.loadCatalog(locale);
  }
  async getPendingInvitations() {
    await this.ensureLoggedIn();
    return this.bring.getPendingInvitations();
  }

  async saveItemBatch(listUuid: string, items: { itemName: string; specification?: string | null }[]) {
    await this.ensureLoggedIn();
    const results = [];
    for (const item of items) {
      const result = await this.bring.saveItem(listUuid, item.itemName, item.specification || '');
      results.push(result);
    }
    return results;
  }

  async deleteMultipleItemsFromList(listUuid: string, itemNames: string[]) {
    await this.ensureLoggedIn();
    const results = [];
    for (const itemName of itemNames) {
      // Assuming itemId is the same as itemName for removal,
      // consistent with how getItems structures it and how removeItem is likely used.
      const result = await this.bring.removeItem(listUuid, itemName);
      results.push(result);
    }
    return results;
  }
}

import Bring from 'bring-shopping';

export class BringClient {
  private bring = new Bring({ mail: process.env.MAIL!, password: process.env.PW! });

  async login() {
    return this.bring.login();
  }
  async loadLists() {
    return this.bring.loadLists();
  }
  async getItems(listUuid: string) {
    return this.bring.getItems(listUuid);
  }
  async getItemsDetails(listUuid: string) {
    return this.bring.getItemsDetails(listUuid);
  }
  async saveItem(listUuid: string, itemName: string, specification?: string) {
    return this.bring.saveItem(listUuid, itemName, specification || '');
  }
  async removeItem(listUuid: string, itemId: string) {
    return this.bring.removeItem(listUuid, itemId);
  }
  async moveToRecentList(listUuid: string, itemId: string) {
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
    // The bring-shopping library's changelog (v1.5.1) fixed this method, implying the signature (listUuid, itemId) is correct.
    // @ts-expect-error Type definitions for bring-shopping may be outdated. Signature based on changelog v1.5.1.
    return this.bring.removeItemImage(listUuid, itemId);
  }

  async getAllUsersFromList(listUuid: string) {
    return this.bring.getAllUsersFromList(listUuid);
  }
  async getUserSettings() {
    return this.bring.getUserSettings();
  }
  async loadTranslations(locale?: string) {
    return this.bring.loadTranslations(locale || 'en-US');
  }
  async loadCatalog(locale: string) {
    return this.bring.loadCatalog(locale);
  }
  async getPendingInvitations() {
    return this.bring.getPendingInvitations();
  }
}

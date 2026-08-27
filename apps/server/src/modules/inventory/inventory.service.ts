import { inventoryRepository } from './inventory.repository';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { QueryInventoryInput, UpdateStockInput } from '@stitch-and-crafts/validation-schemas';

export class InventoryService {
  async getInventory(query: QueryInventoryInput) {
    const result = await inventoryRepository.getInventoryList(query);
    
    let formatted = result.items.map((p) => {
      const hasVariants = p.variants && p.variants.length > 0;
      const totalStock = hasVariants
        ? p.variants.reduce((acc, v) => acc + v.stock, 0)
        : p.stock;

      const status = totalStock === 0 ? 'OUT_OF_STOCK' : totalStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';

      return {
        id: p.id,
        title: p.title,
        sku: p.sku,
        category: p.category.name,
        hasVariants,
        stock: totalStock,
        productStock: p.stock,
        status,
        updatedAt: p.updatedAt,
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          colorName: v.colorName,
          size: v.size,
          stock: v.stock,
          status: v.stock === 0 ? 'OUT_OF_STOCK' : v.stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
        })),
      };
    });

    if (query.status && query.status !== 'ALL') {
      formatted = formatted.filter((item) => item.status === query.status);
    }

    return {
      ...result,
      items: formatted,
    };
  }

  async getProductInventory(productId: string) {
    const data = await inventoryRepository.getProductStock(productId);
    if (!data) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    return data;
  }

  async updateProductStock(productId: string, input: UpdateStockInput) {
    const product = await inventoryRepository.getProductStock(productId);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    return inventoryRepository.updateProductStock(productId, input.stock);
  }

  async updateVariantStock(variantId: string, input: UpdateStockInput) {
    return inventoryRepository.updateVariantStock(variantId, input.stock);
  }
}

export const inventoryService = new InventoryService();

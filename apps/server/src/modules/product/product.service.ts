import { productRepository } from './product.repository';
import { categoryRepository } from '../category/category.repository';
import { slugify } from '../../utils/slugify.util';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import {
  CreateProductInput,
  UpdateProductInput,
  QueryProductInput,
  CreateVariantInput,
  UpdateVariantInput,
} from '@stitch-and-crafts/validation-schemas';

export class ProductService {
  private formatProductOutput(product: any) {
    const price = Number(product.price);
    const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
    let discountPercentage = 0;
    if (discountPrice && price > 0) {
      discountPercentage = Math.round(((price - discountPrice) / price) * 100);
    }

    const totalStock = product.variants && product.variants.length > 0
      ? product.variants.reduce((acc: number, v: any) => acc + v.stock, 0)
      : product.stock;

    const availability = totalStock === 0 ? 'OUT_OF_STOCK' : totalStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';

    const formattedVariants = product.variants?.map((v: any) => {
      const priceDelta = Number(v.priceDelta || 0);
      const finalPrice = price + priceDelta;
      const variantAvailability = v.stock === 0 ? 'OUT_OF_STOCK' : v.stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
      return {
        ...v,
        priceDelta,
        finalPrice,
        availability: variantAvailability,
      };
    });

    return {
      ...product,
      price,
      discountPrice,
      discountPercentage,
      totalStock,
      availability,
      variants: formattedVariants,
    };
  }

  async getPublishedProducts(query: QueryProductInput) {
    const result = await productRepository.findPublished(query);
    return {
      ...result,
      items: result.items.map((p) => this.formatProductOutput(p)),
    };
  }

  async getProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product || !product.isPublished || !product.category.isActive) {
      throw new AppError('Product not found or unavailable', HTTP_STATUS.NOT_FOUND);
    }
    return this.formatProductOutput(product);
  }

  async getFeaturedProducts() {
    const products = await productRepository.findFeatured();
    return products.map((p) => this.formatProductOutput(p));
  }

  async getRelatedProducts(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    const related = await productRepository.findRelated(productId, product.categoryId);
    return related.map((p) => this.formatProductOutput(p));
  }

  async getAllAdminProducts(query: any) {
    const result = await productRepository.findAllAdmin(query);
    return {
      ...result,
      items: result.items.map((p) => this.formatProductOutput(p)),
    };
  }

  async getAdminProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    return this.formatProductOutput(product);
  }

  async createProduct(input: CreateProductInput) {
    // 1. Verify Category
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new AppError('Invalid category ID', HTTP_STATUS.BAD_REQUEST);
    }

    // 2. Unique SKU Check
    const existingSku = await productRepository.findBySku(input.sku);
    if (existingSku) {
      throw new AppError('Product SKU already exists', HTTP_STATUS.CONFLICT);
    }

    // 3. Unique Variant SKU Check
    if (input.variants && input.variants.length > 0) {
      const skus = new Set<string>();
      for (const variant of input.variants) {
        if (skus.has(variant.sku)) {
          throw new AppError(`Duplicate variant SKU ${variant.sku} in payload`, HTTP_STATUS.BAD_REQUEST);
        }
        skus.add(variant.sku);
        const existingVarSku = await productRepository.findVariantBySku(variant.sku);
        if (existingVarSku) {
          throw new AppError(`Variant SKU ${variant.sku} is already in use`, HTTP_STATUS.CONFLICT);
        }
      }
    }

    // 4. Generate SEO Slug
    let slug = slugify(input.title);
    let counter = 1;
    while (await productRepository.findBySlug(slug)) {
      slug = `${slugify(input.title)}-${counter}`;
      counter++;
    }

    const created = await productRepository.createProduct({
      title: input.title,
      slug,
      description: input.description,
      details: input.details,
      price: input.price,
      discountPrice: input.discountPrice || null,
      stock: input.stock,
      sku: input.sku,
      images: input.images,
      categoryId: input.categoryId,
      featured: input.featured ?? false,
      isPublished: input.isPublished ?? true,
      variants: input.variants,
    });

    return this.formatProductOutput(created);
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    if (input.categoryId) {
      const cat = await categoryRepository.findById(input.categoryId);
      if (!cat) {
        throw new AppError('Invalid category ID', HTTP_STATUS.BAD_REQUEST);
      }
    }

    if (input.sku && input.sku !== product.sku) {
      const existingSku = await productRepository.findBySku(input.sku);
      if (existingSku && existingSku.id !== id) {
        throw new AppError('SKU already in use by another product', HTTP_STATUS.CONFLICT);
      }
    }

    let slug = product.slug;
    if (input.title && input.title !== product.title) {
      slug = slugify(input.title);
      let counter = 1;
      while (true) {
        const found = await productRepository.findBySlug(slug);
        if (!found || found.id === id) break;
        slug = `${slugify(input.title)}-${counter}`;
        counter++;
      }
    }

    const updated = await productRepository.updateProduct(id, {
      ...(input.title && { title: input.title }),
      ...(input.title && { slug }),
      ...(input.description && { description: input.description }),
      ...(input.details !== undefined && { details: input.details }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.discountPrice !== undefined && { discountPrice: input.discountPrice }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.sku && { sku: input.sku }),
      ...(input.images && { images: input.images }),
      ...(input.categoryId && { categoryId: input.categoryId }),
      ...(input.featured !== undefined && { featured: input.featured }),
      ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
    });

    return this.formatProductOutput(updated);
  }

  async updateProductStatus(id: string, isPublished: boolean) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    const updated = await productRepository.updateProduct(id, { isPublished });
    return this.formatProductOutput(updated);
  }

  async updateProductFeatured(id: string, featured: boolean) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    const updated = await productRepository.updateProduct(id, { featured });
    return this.formatProductOutput(updated);
  }

  async deleteProduct(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    await productRepository.deleteProduct(id);
    return { deleted: true };
  }

  // Variant Services
  async createVariant(productId: string, input: CreateVariantInput) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    const existingSku = await productRepository.findVariantBySku(input.sku);
    if (existingSku) {
      throw new AppError('Variant SKU already exists', HTTP_STATUS.CONFLICT);
    }

    return productRepository.createVariant(productId, input);
  }

  async getVariantsByProductId(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    return product.variants;
  }

  async updateVariant(productId: string, variantId: string, input: UpdateVariantInput) {
    const variant = await productRepository.findVariantById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new AppError('Variant does not belong to this product', HTTP_STATUS.NOT_FOUND);
    }

    if (input.sku && input.sku !== variant.sku) {
      const existingSku = await productRepository.findVariantBySku(input.sku);
      if (existingSku && existingSku.id !== variantId) {
        throw new AppError('Variant SKU already in use', HTTP_STATUS.CONFLICT);
      }
    }

    return productRepository.updateVariant(variantId, input);
  }

  async deleteVariant(productId: string, variantId: string) {
    const variant = await productRepository.findVariantById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new AppError('Variant does not belong to this product', HTTP_STATUS.NOT_FOUND);
    }
    await productRepository.deleteVariant(variantId);
    return { deleted: true };
  }
}

export const productService = new ProductService();

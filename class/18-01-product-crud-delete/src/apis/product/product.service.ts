import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductInput } from './dto/createProduct.input';
import { UpdateProductInput } from './dto/updateProduct.input';
import { Product } from './entities/product.entity';

interface IFindOne {
  productId: string;
}

interface ICreate {
  createProductInput: CreateProductInput;
}

interface IUpdate {
  productId: string;
  updateProductInput: UpdateProductInput;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll() {
    return await this.productRepository.find();
  }

  async findOne({ productId }: IFindOne) {
    return await this.productRepository.findOne({ id: productId });
  }

  async create({ createProductInput }: ICreate) {
    await this.productRepository.save({
      ...createProductInput, // 스프레드연산자 사용하기

      // 하나하나 직접 나열하기
      // name: createProductInput.name,
      // description: createProductInput.description,
      // price: createProductInput.price,
    });
  }

  async update({ productId, updateProductInput }: IUpdate) {
    const product = await this.productRepository.findOne({ id: productId });
    const newProduct = {
      ...product,
      ...updateProductInput,

      // name: updateProductInput.name,
      // description: updateProductInput.description,
      // price: updateProductInput.price
    };

    return await this.productRepository.save(newProduct);
  }

  async checkSoldout({ productId }) {
    const product = await this.productRepository.findOne({ id: productId });
    if (product.isSoldout)
      throw new UnprocessableEntityException('이미 판매 완료된 상품입니다.');
    // throw new HttpException(
    //   '이미 판매 완료된 상품입니다.',
    //   HttpStatus.UNPROCESSABLE_ENTITY,
    // );
  }

  async delete({ productId }) {
    // 1. 진짜 삭제
    // const result = await this.productRepository.delete({ id: productId });
    // return result.affected ? true : false;
    //
    // 2. 소프트 삭제(직접구현) - 1
    // await this.productRepository.update({id: productId}, { isDeleted: true })
    //
    // 3. 소프트 삭제(직접구현) - 2
    // await this.productRepository.update({ id: productId }, { deletedAt: new Date() })
    //
    // 4. 소프트 삭제(TypeORM 제공) - 1
    // await this.productRepository.softRemove({ id: productId }) // id로만 삭제 가능
    //
    // 5. 소프트 삭제(TypeORM 제공) - 2
    const result = await this.productRepository.softDelete({ id: productId }); // 다양한 조건으로 삭제 가능
    return result.affected ? true : false;
  }
}

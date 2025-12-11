import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {

  @Prop({ type: String })
  title: string;
  
    @Prop({ type: String })
  category: string;  

     @Prop({ type: String })
     subject: string;  


  @Prop({  type: String })
  authorName: string;  


    @Prop({  type: String })
  publisherName: string;  


  @Prop({ type: String })
  rackName: string;  
  
    @Prop({ type: String })
    desciption: string;  
  
   
  @Prop({  type: String, })
  isbn: string;  

  @Prop({  type: Number, default: 0 })
  Quantity: number; 

 @Prop({  type: Number })
  bookPrice: number; 

}

export const BookSchema = SchemaFactory.createForClass(Book);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';


export type LibraryDocument = Library & Document;

@Schema({ timestamps: true })
export class Library {

  @Prop({ required: true, type: String })
  schoolId: string;  

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] })
  books: string[];  

  @Prop({
    type: [{
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },  
      memberType: { type: String }
    }]
  })
  members: { memberId: string, memberType: string }[]; 

}

export const LibrarySchema = SchemaFactory.createForClass(Library);

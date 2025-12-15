import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum StatusNotaFiscal {
  PENDENTE_EMISSAO = 'PENDENTE_EMISSAO',
  EMITIDA = 'EMITIDA',
  CANCELADA = 'CANCELADA',
}

@Entity('notas_fiscais')
export class NotaFiscal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 18 })
  cnpj!: string;

  @Column({ type: 'varchar', length: 255 })
  municipio!: string;

  @Column({ type: 'varchar', length: 2 })
  estado!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor!: number;

  @Column({ type: 'datetime' })
  dataDesejadaEmissao!: Date;

  @Column({ type: 'text' })
  descricao!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: StatusNotaFiscal.PENDENTE_EMISSAO,
  })
  status!: StatusNotaFiscal;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numeroNF?: string;

  @Column({ type: 'datetime', nullable: true })
  dataEmissao?: Date;

  @CreateDateColumn()
  dataCriacao!: Date;

  @UpdateDateColumn()
  dataAtualizacao!: Date;
}


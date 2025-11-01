export interface Entity {
  _id: string;
  name: string;
  type: string;
  path: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  children?: Entity[];
}

import { CategoryId, ColumnId, LowerCategoryId, UpperCategoryId } from './types';

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  section: 'upper' | 'lower';
}

export const UPPER_CATEGORIES: CategoryDefinition[] = [
  { id: 'ones', label: 'Ases (1)', section: 'upper' },
  { id: 'twos', label: 'Duques (2)', section: 'upper' },
  { id: 'threes', label: 'Ternos (3)', section: 'upper' },
  { id: 'fours', label: 'Quadras (4)', section: 'upper' },
  { id: 'fives', label: 'Quinas (5)', section: 'upper' },
  { id: 'sixes', label: 'Senas (6)', section: 'upper' },
];

export const LOWER_CATEGORIES: CategoryDefinition[] = [
  { id: 'twoPairs', label: '2 Pares', section: 'lower' },
  { id: 'threeOfAKind', label: 'Trinca', section: 'lower' },
  { id: 'fullHouse', label: 'Full House', section: 'lower' },
  { id: 'smallStraight', label: 'Sequência Mínima', section: 'lower' },
  { id: 'largeStraight', label: 'Sequência Máxima', section: 'lower' },
  { id: 'fourOfAKind', label: 'Quadra', section: 'lower' },
  { id: 'chance', label: 'Chance', section: 'lower' },
  { id: 'yan', label: 'Yan', section: 'lower' },
];

/** Ordem impressa da cartela: usada pela coluna "descida" (Ases -> Yan). */
export const CATEGORY_ORDER: CategoryDefinition[] = [
  ...UPPER_CATEGORIES,
  ...LOWER_CATEGORIES,
];

export function isUpperCategory(id: CategoryId): id is UpperCategoryId {
  return UPPER_CATEGORIES.some((category) => category.id === id);
}

export function isLowerCategory(id: CategoryId): id is LowerCategoryId {
  return LOWER_CATEGORIES.some((category) => category.id === id);
}

export const UPPER_BONUS_THRESHOLD = 60;
export const UPPER_BONUS_AMOUNT = 40;

/** Só é concedido se a coluna também tiver alcançado o bônus da seção superior. */
export const WHOLE_COLUMN_BONUS_AMOUNT = 40;

export interface ColumnDefinition {
  id: ColumnId;
  label: string;
  order: 'forcedDown' | 'forcedUp' | 'free';
  /** true apenas para "seco": só aceita o resultado da 1ª rolagem do turno. */
  requiresFirstRollOnly: boolean;
  description: string;
}

export const COLUMNS: ColumnDefinition[] = [
  {
    id: 'descida',
    label: 'Descida',
    order: 'forcedDown',
    requiresFirstRollOnly: false,
    description: 'Preenche de Ases até Yan, na ordem.',
  },
  {
    id: 'subida',
    label: 'Subida',
    order: 'forcedUp',
    requiresFirstRollOnly: false,
    description: 'Preenche de Yan até Ases, na ordem.',
  },
  {
    id: 'desordem',
    label: 'Desordem',
    order: 'free',
    requiresFirstRollOnly: false,
    description: 'Qualquer jogada livre, em qualquer ordem.',
  },
  {
    id: 'seco',
    label: 'Seco',
    order: 'free',
    requiresFirstRollOnly: true,
    description: 'Só vale o resultado da 1ª rolagem do turno, sem segurar/re-rolar.',
  },
];

export function getColumnDefinition(columnId: ColumnId): ColumnDefinition {
  const definition = COLUMNS.find((column) => column.id === columnId);
  if (!definition) {
    throw new Error(`Unknown column: ${columnId}`);
  }
  return definition;
}

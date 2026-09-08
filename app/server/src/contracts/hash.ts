import { canonicalJson, sha256Hex } from '../util/canonical.js';
import { ContractDoc, hashableView } from './model.js';

/** هش متعارف — sha256 over canonical JSON of the hashable view. */
export function contractHash(doc: ContractDoc): string {
  return sha256Hex(canonicalJson(hashableView(doc)));
}

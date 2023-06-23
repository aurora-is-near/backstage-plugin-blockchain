import {
  ApiEntity,
  ComponentEntity,
  ResourceEntity,
  UserEntity,
  Entity,
  isApiEntity,
  isResourceEntity,
  isUserEntity,
  isComponentEntity,
  GroupEntity,
} from '@backstage/catalog-model';
import { BlockchainAdapter } from '../adapters/BlockchainAdapter';
import {
  ContractDeploymentSpec as DeploymentSpec,
  MultisigSpec,
  NearKeysSpec,
} from '@aurora-is-near/backstage-plugin-blockchain-common';

export interface NetworkInfo {
  name: string;
  networkId: number;
  chainId: number;
}

// apologies for this being stringly-typed, but that's how
// Etherscan does it
export interface EtherscanResult {
  SourceCode: string; // really: string | SolcSources | SolcInput
  ABI: string; // really: it's the ABI [we won't use this]
  ContractName: string;
  CompilerVersion: string;
  OptimizationUsed: string; // really: a number used as a boolean
  Runs: string; // really: a number
  ConstructorArguments: string; // encoded as hex string, no 0x in front
  EVMVersion: string;
  Library: string; // semicolon-delimited list of colon-delimited name-address pairs (addresses lack 0x in front)
  LicenseType: string; // ignored
  Proxy: string; // no clue what this is [ignored]
  Implementation: string; // or this [ignored]
  SwarmSource: string; // ignored
}

export interface SupportedNetworks {
  [name: string]: NetworkInfo;
}

export interface FetcherOptions {
  apiKey?: string;
}

export interface SourceInfo {
  contractName?: string;
  sources: SourcesByPath;
  options: CompilerOptions;
  etherScanResult: EtherscanResult;
}

export interface SourcesByPath {
  [sourcePath: string]: string;
}

// apologies if reinventing the wheel here
export type CompilerOptions = SolcOptions | VyperOptions; // note: only Solidity really supported atm

export interface SolcOptions {
  language: 'Solidity' | 'Yul'; // again, only Solidity really supported atm
  version: string;
  settings: SolcSettings;
  specializations: SolcSpecializations;
}

export interface VyperOptions {
  language: 'Vyper';
  version: string;
  settings: VyperSettings;
  specializations: VyperSpecializations;
}

// only including settings that would alter compiled result
// (no outputSelection, no modelChecker once that exists, no stopAfter)
export interface SolcSettings {
  remappings?: string[];
  optimizer?: OptimizerSettings;
  evmVersion?: string; // not gonna enumerate these
  debug?: DebugSettings;
  metadata?: MetadataSettings;
  viaIR?: boolean;
  libraries?: LibrarySettings; // note: we don't actually want to return this!
  compilationTarget?: {
    // not actually a valid compiler setting, but rather where the
    // contract name is stored! (as the lone value, the lone key being the source
    // where it's defined)
    [sourcePath: string]: string;
  };
}

export interface VyperSettings {
  evmVersion?: string; // not gonna enumerate these
  optimize?: boolean; // warning: the Vyper compiler treats this as true if it's not specified!
  // also Etherscan currently doesn't support this flag; any Vyper contract currently
  // verified on Etherscan necessarily has this field unspecified (and thus effectively true)
}

export interface SolcSpecializations {
  libraries?: LibrarySettings;
  constructorArguments?: string; // encoded, as hex string, w/o 0x in front
}

export interface VyperSpecializations {
  constructorArguments?: string; // encoded, as hex string, w/o 0x in front
}

export interface SolcSources {
  [sourcePath: string]: {
    keccak256?: string;
    content?: string; // for Etherscan we assume this exists
    urls?: string;
  };
}

export interface SolcInput {
  language: 'Solidity';
  sources: SolcSources;
  settings: SolcSettings;
}

export interface SolcMetadata {
  language: 'Solidity' | 'Yul';
  compiler: {
    version: string;
  };
  settings: SolcSettings;
  sources: SolcSources;
  version: number;
  // there's also output, but we don't care about that
}

export interface LibrarySettings {
  [contractPath: string]: Libraries;
}

export interface Libraries {
  [libraryName: string]: string;
}

export interface MetadataSettings {
  useLiteralContent?: boolean;
  bytecodeHash?: 'none' | 'ipfs' | 'bzzr1';
}

export interface DebugSettings {
  revertStrings?: 'default' | 'strip' | 'debug' | 'verboseDebug';
}

export interface OptimizerSettings {
  enabled?: boolean;
  runs?: number;
  details?: OptimizerDetails;
}

export interface OptimizerDetails {
  peephole?: boolean;
  jumpdestRemover?: boolean;
  orderLiterals?: boolean;
  deduplicate?: boolean;
  cse?: boolean;
  constantOptimizer?: boolean;
  yul?: boolean;
  yulDetails?: YulDetails;
}

export interface YulDetails {
  stackAllocation?: boolean;
  optimizerSteps?: string;
}

type BlockchainRoleGroupSpec = GroupEntity['spec'] & {
  admins: string[] | undefined;
};

export interface BlockchainRoleGroup extends GroupEntity {
  spec: {
    [K in keyof BlockchainRoleGroupSpec]: BlockchainRoleGroupSpec[K];
  };
}

export interface BlockchainUser extends UserEntity {
  spec: UserEntity['spec'] & {
    interactsWith?: string[];
    keys?: string[];
    deprecated?: string[];
    nearKeys?: NearKeysSpec;
  };
}

export function isBlockchainUser(entity: Entity): entity is BlockchainUser {
  return isUserEntity(entity);
}

export interface ContractComponentEntity extends ComponentEntity {
  spec: ComponentEntity['spec'] & {
    type: 'contract';
  };
}

export function isContractComponent(
  entity: Entity,
): entity is ContractComponentEntity {
  return isComponentEntity(entity) && entity.spec.type === 'contract';
}

export interface MultisigComponentEntity extends ComponentEntity {
  spec: ComponentEntity['spec'] & {
    type: 'contract';
  };
}

export function isMultisigComponent(
  entity: Entity,
): entity is MultisigComponentEntity {
  return isComponentEntity(entity) && entity.spec.type === 'multisig';
}

type BlockchainAddressSpec = (ApiEntity['spec'] | ResourceEntity['spec']) & {
  lifecycle: string;
  address: string;
  network: string;
  networkType: string;
  role: string;
  nearKeys?: NearKeysSpec;
};

export interface BlockchainAddressEntity extends Entity {
  kind: ApiEntity['kind'] | ResourceEntity['kind'];
  spec: {
    [Property in keyof BlockchainAddressSpec]: BlockchainAddressSpec[Property];
  };
}

export function isBlockchainAddress(
  entity: Entity,
): entity is BlockchainAddressEntity {
  return !!(entity as BlockchainAddressEntity).spec?.address;
}

export function isValidBlockchainAddress(
  entity: Entity,
  adapter: BlockchainAdapter,
): entity is BlockchainAddressEntity {
  return (
    isBlockchainAddress(entity) && adapter.isValidAddress(entity.spec.address)
  );
}

type ContractDeploymentSpec = ApiEntity['spec'] &
  BlockchainAddressEntity['spec'] & {
    type: 'contract-deployment' | 'multisig-deployment';
    deployment?: DeploymentSpec;
  };

export interface ContractDeploymentEntity extends ApiEntity {
  spec: {
    [Property in keyof ContractDeploymentSpec]: ContractDeploymentSpec[Property];
  };
}

// Also processes multisig contracts - needs to fetch the policy
// from the on-chain state
export function isContractDeployment(
  entity: Entity,
): entity is ContractDeploymentEntity {
  return (
    isApiEntity(entity) &&
    ['contract-deployment', 'multisig-deployment'].includes(entity.spec.type)
  );
}

type MultisigDeploymentSpec = ApiEntity['spec'] &
  BlockchainAddressEntity['spec'] & {
    type: 'multisig-deployment' | 'admin-address';
    multisig?: MultisigSpec;
  };

/**
 * Bespoke (AdminControlled) roles/mulstisigs are discovered on-chain
 * by the ContractProcessor and those autogenerated entities
 * are of "Resource/admin-address" type - subject to change in the future
 *
 * Kept for backwards-compatibility only
 *
 * Explicitly defined multisig deployments are emitted as "API/multisig-deployment""
 *
 */
export interface MultisigDeploymentEntity extends Entity {
  kind: ApiEntity['kind'] | ResourceEntity['kind'];
  spec: {
    [Property in keyof MultisigDeploymentSpec]: MultisigDeploymentSpec[Property];
  };
}

export function isMultisigDeployment(
  entity: Entity,
): entity is MultisigDeploymentEntity {
  return (
    (isResourceEntity(entity) && entity.spec.type === 'admin-address') ||
    (isApiEntity(entity) && entity.spec.type === 'multisig-deployment')
  );
}

type SignerSpec = Omit<BlockchainAddressEntity['spec'], 'type'> & {
  type: 'signer-address';
};

export interface SignerEntity extends BlockchainAddressEntity {
  kind: ResourceEntity['kind'];
  spec: {
    [Property in keyof SignerSpec]: SignerSpec[Property];
  };
}

export function isSigner(entity: Entity): entity is SignerEntity {
  return isResourceEntity(entity) && entity.spec.type === 'signer-address';
}

type CouncilSpec = Omit<BlockchainAddressEntity['spec'], 'type'> & {
  type: 'council-address';
};

export interface CouncilEntity extends BlockchainAddressEntity {
  kind: ResourceEntity['kind'];
  spec: {
    [Property in keyof CouncilSpec]: CouncilSpec[Property];
  };
}

export function isCouncil(entity: Entity): entity is CouncilEntity {
  return isResourceEntity(entity) && entity.spec.type === 'council-address';
}

type AccessKeySpec = Omit<BlockchainAddressEntity['spec'], 'type'> & {
  type: 'access-key';
};

export interface AccessKeyEntity extends BlockchainAddressEntity {
  kind: ResourceEntity['kind'];
  spec: {
    [Property in keyof AccessKeySpec]: AccessKeySpec[Property];
  };
}

export function isAccessKey(entity: Entity): entity is AccessKeyEntity {
  return isResourceEntity(entity) && entity.spec.type === 'access-key';
}

/* eslint-disable @backstage/no-undeclared-imports */
import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { EntityProvider } from '@backstage/plugin-catalog-node';
// import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { GithubEntityProvider } from '@backstage/plugin-catalog-backend-module-github';

import {
  ContractProcessor,
  MultisigProcessor,
  NearKeysProcessor,
  SputnikProcessor,
  SecurityPolicyProcessor,
} from '@aurora-is-near/backstage-plugin-blockchain-backend';

export default async function createPlugin(
  env: any,
  providers?: Array<EntityProvider>,
) {
  const builder = CatalogBuilder.create(env);

  builder.addEntityProvider(
    GithubEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      scheduler: env.scheduler,
    }),
  );

  // builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addProcessor(new ContractProcessor(env));
  builder.addProcessor(new MultisigProcessor(env));
  builder.addProcessor(new SputnikProcessor(env));
  builder.addProcessor(new NearKeysProcessor(env));
  builder.addProcessor(new SecurityPolicyProcessor(env));
  builder.setProcessingIntervalSeconds(600); // github api rate limit

  builder.addEntityProvider(providers ?? []);
  builder.addEntityProvider(
    GithubEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      // optional: alternatively, use scheduler with schedule defined in app-config.yaml
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 30 },
        timeout: { minutes: 3 },
      }),
      // optional: alternatively, use schedule
      scheduler: env.scheduler,
    }),
  );

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
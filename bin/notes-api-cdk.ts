#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NotesApiCdkStack } from '../lib/notes-api-cdk-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { devProps } from '../config/dev-stage-props';
import { prodProps } from '../config/prod-stage-props';

const app = new cdk.App({
  context: {
    ghBranch: process.env.GITHUB_REF, // github branch
  },
});

const ghBranch = app.node.tryGetContext('ghBranch');

if (ghBranch === 'dev') {
  const devStack = new NotesApiCdkStack(
    app,
    'NotesApiServiceStack-dev',
    devProps
  );

  cdk.Tags.of(devStack).add('Environment', devProps.stage);
} else if (ghBranch === 'refs/tags/releases') {
  const productionStack = new PipelineStack(
    app,
    'NotesApiStack-prod',
    prodProps
  );

  cdk.Tags.of(productionStack).add('Environment', prodProps.stage);
} else {
  throw new Error('Please set GITHUB_REF before you apply stacks.');
}

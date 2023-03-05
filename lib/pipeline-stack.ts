import { Stack } from 'aws-cdk-lib';
import { StackCapabilities } from 'cdk-pipelines-github';
import { Workflow, WorkflowProps } from './constructs/workflow-construct';
import { Staging, StagingProps } from './staging';
import { Construct } from 'constructs';

export interface PipelineStackProps extends WorkflowProps, StagingProps {}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const { stage } = props;

    // * Define pipeline
    const workflow = new Workflow(this, 'Pipeline', {
      ...props,
      trustedAccount: props.trustedAccount ?? this.account,
      trustedRegion: this.region ?? 'ap-southeast-1',
    });

    // * Add stage to the pipeline
    workflow.pipeline.addStageWithGitHubOptions(
      new Staging(this, `${stage}-stage`, props),
      {
        gitHubEnvironment: stage,
        stackCapabilities: [StackCapabilities.IAM, StackCapabilities.NAMED_IAM],
      }
    );
  }
}

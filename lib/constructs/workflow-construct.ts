import { Construct } from 'constructs';
import { ShellStep } from 'aws-cdk-lib/pipelines';
import {
  GitHubWorkflow,
  WorkflowTriggers,
  AwsCredentials,
} from 'cdk-pipelines-github';
import * as path from 'path';

export interface WorkflowProps {
  /**
   * Account ID that is used for authenticating for GitHub action role, e.g. 123456789012.
   */
  trustedAccount?: string;

  /**
   * Will assume the GitHubActionRole in this region when publishing assets. This is NOT the region in which the assets are published.
   *
   * @default ap-southeast-1
   */
  trustedRegion?: string;

  /**
   * Deployment environment, e.g. Development/Staging/Production.
   *
   * @required
   */
  stage: string;
}

export class Workflow extends Construct {
  /**
   * Pipelines that using Github Workflow.
   */
  public readonly pipeline: GitHubWorkflow;

  constructor(scope: Construct, id: string, props: WorkflowProps) {
    super(scope, id);

    const { trustedAccount, trustedRegion, stage } = props;

    // * Set workflow trigger based on stage environment
    let workflowTriggers: WorkflowTriggers;
    if (stage === 'production') {
      workflowTriggers = {
        push: {
          tags: ['releases/**'], // production env will trigger based on release tags
        },
      };
    } else {
      workflowTriggers = {
        push: {
          branches: [stage],
        },
      };
    }

    // * Create pipeline
    this.pipeline = new GitHubWorkflow(this, 'Pipeline', {
      synth: new ShellStep('synthesize', {
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
      // gitHubActionRoleArn // ! Deprecated, used awsCreds prop instead
      awsCreds: AwsCredentials.fromOpenIdConnect({
        gitHubActionRoleArn: `arn:aws:iam::${trustedAccount}:role/GitHubActionRole`,
      }),
      publishAssetsAuthRegion: trustedRegion,
      workflowName: `${stage}-deployment`,
      workflowPath: path.join(
        __dirname,
        `../../.github/workflows/${stage}.yml`
      ),
      workflowTriggers,
    });
  }
}

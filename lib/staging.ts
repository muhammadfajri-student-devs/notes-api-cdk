import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NotesApiCdkStack, NotesApiCdkStackProps } from './notes-api-cdk-stack';

export interface StagingProps extends NotesApiCdkStackProps, StageProps {}

export class Staging extends Stage {
  constructor(scope: Construct, id: string, props: StagingProps) {
    super(scope, id, props);

    new NotesApiCdkStack(this, 'CoreStacks', props);
  }
}

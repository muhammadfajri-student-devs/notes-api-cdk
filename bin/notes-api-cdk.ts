#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NotesApiCdkStack } from '../lib/notes-api-cdk-stack';

const app = new cdk.App();
new NotesApiCdkStack(app, 'NotesApiCdkStack', {});

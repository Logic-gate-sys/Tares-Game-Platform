import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yamljs';
import {serve, setup} from 'swagger-ui-express';



const openApiPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../openapi.yaml');

const document = YAML.load(openApiPath);

export const docsMiddleware = [serve, setup(document)];

// __tests__/lib/page-elements/field-handlers/textarea.setup.js

import { fileURLToPath } from 'url';
import fs from 'node:fs';
import path from 'node:path';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

// Load EasyMDE script
const easyMDEPath = path.join( __dirname, '../../../screens/edit-project/easymde.js' );
const easyMDEScript = fs.readFileSync( easyMDEPath, 'utf8' );

// Execute the script in global context
eval( easyMDEScript );

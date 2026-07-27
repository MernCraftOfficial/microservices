import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';

const templatesDir = path.join(process.cwd(), 'templates');
const partialsDir = path.join(templatesDir, 'partials');

// Register partials once
const registerPartials = async () => {
  const files = await fs.readdir(partialsDir);

  for (const file of files) {
    const partialName = path.basename(file, '.hbs');
    const content = await fs.readFile(path.join(partialsDir, file), 'utf-8');

    Handlebars.registerPartial(partialName, content);
  }
};

let partialsRegistered = false;

export const compileHbs = async (
  templateName: string,
  context: Record<string, any>,
): Promise<string> => {
  if (!partialsRegistered) {
    await registerPartials();
    partialsRegistered = true;
  }

  const templatePath = path.join(templatesDir, `${templateName}.hbs`);

  const source = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(source);

  return template(context);
};

import { FileSelect, IFileSelectOptions } from '../src/widgets/fileselect.js';

// Valid FileSelect options.
const fileselect: IFileSelectOptions = {
  label: 'Choose file',
  accept: '.txt,.pdf,image/*',
  multiple: false,
  placeholder: 'No file selected',
};

new FileSelect(fileselect);
new FileSelect({ multiple: true });

// Invalid multiple type should be rejected.
const badMultiple: IFileSelectOptions = {
  label: 'x',
  // @ts-expect-error multiple must be a boolean
  multiple: 'true',
};

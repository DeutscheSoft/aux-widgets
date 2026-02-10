import { FileSelect, IFileSelectOptions } from '../src/widgets/fileselect.js';

// Valid FileSelect options.
const fileselect: IFileSelectOptions = {
  label: 'Choose file',
  accept: '.txt,.pdf,image/*',
  multiple: false,
  placeholder: 'No file selected',
};

const fileselectWidget = new FileSelect(fileselect);
new FileSelect({ multiple: true });

// .set(key, value) API type-checking
fileselectWidget.set('multiple', true);
// @ts-expect-error value for 'multiple' must be boolean
fileselectWidget.set('multiple', 'true');

// Invalid multiple type should be rejected.
const badMultiple: IFileSelectOptions = {
  label: 'x',
  // @ts-expect-error multiple must be a boolean
  multiple: 'true',
};

import { addCollection } from '@iconify/vue';
import { iconCollections } from './icon-data';

for (const collection of iconCollections) {
	addCollection(collection);
}

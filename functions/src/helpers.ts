export const translateFromFieldName = (fieldName: string) => {
	switch (fieldName) {
	case 'coordinates':
		return 'Lokacija';
	case 'partOfTown':
		return 'Kvart';
	case 'images':
		return 'Slike';
	case 'roomCount':
		return 'Broj soba';
	case 'bathroomCount':
		return 'Broj kupaonica';
	case 'price':
		return 'Cijena';
	case 'contactNumber':
		return 'Kontakt broj';
	case 'title':
		return 'Naslov';
	case 'area':
		return 'Površina';
	case 'street':
		return 'Ime ulice';
	case 'streetNumber':
		return 'Kućni broj';
	case 'description':
		return 'Opis';
	case 'availableFrom':
		return 'Dostupno od';
	default:
		return '';
	}
};

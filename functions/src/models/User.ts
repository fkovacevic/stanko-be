import { PartOfTown } from '../shared/PartOfTown';


interface UserServiceModel {
	id: number;
	data: any;
}

interface UserSubscription {
	priceMin?: number;
	priceMax?: number;
	areaMin?: number;
	areaMax?: number;
	partOfTown?: typeof PartOfTown;
}

class User {
	id?: number;
	userSubscription: UserSubscription;
	pushSubscription: PushSubscription[];
	constructor(userSM: UserServiceModel) {
		const { id, data } = userSM;
		const { priceMin, priceMax, areaMin, areaMax, partOfTown, pushSubscription } = data;
		this.id = id;
		this.userSubscription = {
			priceMin,
			priceMax,
			areaMin,
			areaMax,
			partOfTown,
		};
		this.pushSubscription = pushSubscription;
	}
}

export default User;

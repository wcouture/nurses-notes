export class Patient {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public phone: string,
        public birthdate: Date,
        public street_address: string,
        public city_state_zip: string,
        public is_user: boolean) {}
}
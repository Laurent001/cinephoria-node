export type FakeDataType = {
  incidents: {
    id: number;
    description: string;
    added_date: string;
    is_solved: number;
    material: {
      id: number;
      name: string;
      description: string;
    };
    auditorium: {
      id: number;
      name: string;
      seat: number;
      seat_handi: number;
      quality_id: number;
      cinema: {
        id: number;
        name: string;
        address: string;
        city: string;
        postcode: string;
        phone: string;
      };
    };
  }[];
  auditoriums: {
    id: number;
    cinema_id: number;
    quality_id: number;
    name: string;
    seat: number;
    seat_handi: number;
  }[];
  materials: {
    id: number;
    name: string;
    description: string;
  }[];
};

export type ScholarshipProgramType = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  scholarshipAmount: number;
  numberOfScholarships: number;
  deadline: string;
  // numberOfRenewals: number;
  funderId: number;
  // providerId: number;
  createAt: Date;
  updateAt: Date;
  status: string;
  category: {
    id: string;
    name: string;
    description: string;
  };
  major:{
    id: string;
    name: string;
    description: string;
    skills: Array<{
        id: string;
        name: string;
        description: string;
        type: string;
    }>;
  };
  certificates: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
  }>;
  university: {
     id: string; 
     name: string;
     description: string;
     city: string;
     country: string|null;
  };
};

export const scholarshipProgram: ScholarshipProgramType[] = [
];

export default scholarshipProgram;

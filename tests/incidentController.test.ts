import * as incidentController from "../src/api/controllers/incidentController.ts";
import * as incidentService from "../src/services/incident.service.ts";
import * as mariadbService from "../src/services/mariadb.service.ts";
import { FakeDataType } from "../types/fake.ts";

declare module "../src/services/mariadb.service.ts" {
  export const executeTransaction: jest.Mock;
  export const query: jest.Mock;
}

jest.mock("../src/services/mariadb.service.ts", () => ({
  executeTransaction: jest.fn(),
  query: jest.fn(),
}));

jest.mock("../src/services/incident.service.ts", () => ({
  fetchIncidents: jest.fn(),
}));

const fakeData = {
  incidents: [
    {
      id: 1,
      description: "Projecteur affiche des images floues",
      added_date: "2024-11-15T10:45:00.000Z",
      is_solved: 0,
      material: {
        id: 1,
        name: "Projecteur",
        description: "Appareil de projection cinématographique",
      },
      auditorium: {
        id: 1,
        name: "Salle Nantes 1",
        seat: 100,
        seat_handi: 5,
        quality_id: 1,
        cinema: {
          id: 1,
          name: "Cinéma Nantes",
          address: "123 Rue de Nantes",
          city: "Nantes",
          postcode: "44000",
          phone: "0123456789",
        },
      },
    },
    {
      id: 2,
      description: "Son grésillant sur les hauts-parleurs gauches",
      added_date: "2024-11-20T10:45:00.000Z",
      is_solved: 1,
      material: {
        id: 3,
        name: "Système audio",
        description: "Équipement sonore de la salle",
      },
      auditorium: {
        id: 2,
        name: "Salle Nantes 2",
        seat: 150,
        seat_handi: 5,
        quality_id: 1,
        cinema: {
          id: 1,
          name: "Cinéma Nantes",
          address: "123 Rue de Nantes",
          city: "Nantes",
          postcode: "44000",
          phone: "0123456789",
        },
      },
    },
  ],
  auditoriums: [
    {
      id: 1,
      cinema_id: 1,
      quality_id: 1,
      name: "Salle Nantes 1",
      seat: 100,
      seat_handi: 5,
    },
  ],
  materials: [
    {
      id: 1,
      name: "Projecteur",
      description: "Appareil de projection cinématographique",
    },
    { id: 2, name: "Écran", description: "Surface de projection" },
  ],
};

let testData: FakeDataType;

beforeEach(() => {
  testData = JSON.parse(JSON.stringify(fakeData));
});

describe("addIncident", () => {
  it("devrait ajouter un incident et retourner les incidents incluant le nouvel incident", async () => {
    const req: any = {
      body: {
        id: undefined,
        description: "Problème de son",
        is_solved: false,
        material: { id: 1 },
        auditorium: { id: 2 },
      },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (incidentService.fetchIncidents as jest.Mock).mockImplementation(() => {
      const newIncident = {
        id: 3,
        description: "Problème de son",
        added_date: "2024-11-16T10:45:00.000Z",
        is_solved: 0,
        material: {
          id: 1,
          name: "Projecteur",
          description: "Appareil de projection cinématographique",
        },
        auditorium: {
          id: 2,
          name: "Salle Nantes 2",
          seat: 150,
          seat_handi: 5,
          quality_id: 1,
          cinema: {
            id: 1,
            name: "Cinéma Nantes",
            address: "123 Rue de Nantes",
            city: "Nantes",
            postcode: "44000",
            phone: "0123456789",
          },
        },
      };

      testData.incidents.push(newIncident);
      return testData;
    });

    (mariadbService.executeTransaction as jest.Mock).mockImplementation(
      async (callback: any) => {
        await callback();
        return testData;
      }
    );

    await incidentController.addIncident(req, res);

    expect(res.json).toHaveBeenCalledWith({
      incidents: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          description: "Projecteur affiche des images floues",
          added_date: "2024-11-15T10:45:00.000Z",
          is_solved: 0,
          material: expect.objectContaining({
            id: 1,
            name: "Projecteur",
            description: "Appareil de projection cinématographique",
          }),
          auditorium: expect.objectContaining({
            id: 1,
            name: "Salle Nantes 1",
            seat: 100,
            seat_handi: 5,
            quality_id: 1,
            cinema: expect.objectContaining({
              id: 1,
              name: "Cinéma Nantes",
              address: "123 Rue de Nantes",
              city: "Nantes",
              postcode: "44000",
              phone: "0123456789",
            }),
          }),
        }),
        expect.objectContaining({
          id: 2,
          description: "Son grésillant sur les hauts-parleurs gauches",
          added_date: "2024-11-20T10:45:00.000Z",
          is_solved: 1,
          material: expect.objectContaining({
            id: 3,
            name: "Système audio",
            description: "Équipement sonore de la salle",
          }),
          auditorium: expect.objectContaining({
            id: 2,
            name: "Salle Nantes 2",
            seat: 150,
            seat_handi: 5,
            quality_id: 1,
            cinema: expect.objectContaining({
              id: 1,
              name: "Cinéma Nantes",
              address: "123 Rue de Nantes",
              city: "Nantes",
              postcode: "44000",
              phone: "0123456789",
            }),
          }),
        }),
        expect.objectContaining({
          id: 3,
          description: "Problème de son",
          added_date: "2024-11-16T10:45:00.000Z",
          is_solved: 0,
          material: expect.objectContaining({
            id: 1,
            name: "Projecteur",
            description: "Appareil de projection cinématographique",
          }),
          auditorium: expect.objectContaining({
            id: 2,
            name: "Salle Nantes 2",
            seat: 150,
            seat_handi: 5,
            quality_id: 1,
            cinema: expect.objectContaining({
              id: 1,
              name: "Cinéma Nantes",
              address: "123 Rue de Nantes",
              city: "Nantes",
              postcode: "44000",
              phone: "0123456789",
            }),
          }),
        }),
      ]),
      auditoriums: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          cinema_id: 1,
          quality_id: 1,
          name: "Salle Nantes 1",
          seat: 100,
          seat_handi: 5,
        }),
      ]),
      materials: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          name: "Projecteur",
          description: "Appareil de projection cinématographique",
        }),
      ]),
    });

    const incidents = res.json.mock.calls[0][0]["incidents"];
    expect(incidents.length).toBe(3);

    expect(res.json).toHaveBeenCalledWith(testData);
    expect(mariadbService.executeTransaction).toHaveBeenCalled();
  });

  it("devrait retourner une erreur si l'id est défini", async () => {
    const req: any = {
      body: {
        id: 99,
        description: "Erreur test",
        is_solved: false,
        material: { id: 1 },
        auditorium: { id: 2 },
      },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await incidentController.addIncident(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "id defined" });
  });
});

describe("getIncidents", () => {
  it("devrait renvoyer les incidents si tout se passe bien", async () => {
    const req: any = {};

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (incidentService.fetchIncidents as jest.Mock).mockResolvedValueOnce(
      testData
    );

    await incidentController.getIncidents(req, res);

    expect(res.json).toHaveBeenCalledWith({
      incidents: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          description: "Projecteur affiche des images floues",
          added_date: "2024-11-15T10:45:00.000Z",
          is_solved: 0,
          material: expect.objectContaining({
            id: 1,
            name: "Projecteur",
            description: "Appareil de projection cinématographique",
          }),
          auditorium: expect.objectContaining({
            id: 1,
            name: "Salle Nantes 1",
            seat: 100,
            seat_handi: 5,
            quality_id: 1,
            cinema: expect.objectContaining({
              id: 1,
              name: "Cinéma Nantes",
              address: "123 Rue de Nantes",
              city: "Nantes",
              postcode: "44000",
              phone: "0123456789",
            }),
          }),
        }),
        expect.objectContaining({
          id: 2,
          description: "Son grésillant sur les hauts-parleurs gauches",
          added_date: "2024-11-20T10:45:00.000Z",
          is_solved: 1,
          material: expect.objectContaining({
            id: 3,
            name: "Système audio",
            description: "Équipement sonore de la salle",
          }),
          auditorium: expect.objectContaining({
            id: 2,
            name: "Salle Nantes 2",
            seat: 150,
            seat_handi: 5,
            quality_id: 1,
            cinema: expect.objectContaining({
              id: 1,
              name: "Cinéma Nantes",
              address: "123 Rue de Nantes",
              city: "Nantes",
              postcode: "44000",
              phone: "0123456789",
            }),
          }),
        }),
      ]),
      auditoriums: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          cinema_id: 1,
          quality_id: 1,
          name: "Salle Nantes 1",
          seat: 100,
          seat_handi: 5,
        }),
      ]),
      materials: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          name: "Projecteur",
          description: "Appareil de projection cinématographique",
        }),
      ]),
    });

    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("updateIncident", () => {
  it("devrait mettre à jour un incident et retourner la liste mise à jour", async () => {
    const req: any = {
      body: {
        locale: "Europe/Paris",
        incident: {
          id: 1,
          description: "Projecteur réparé, fonctionne normalement",
          added_date: "2024-11-17T09:30:00.000Z",
          is_solved: 1,
          material: { id: 1 },
          auditorium: { id: 1 },
        },
      },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (incidentService.fetchIncidents as jest.Mock).mockImplementation(() => {
      const index = testData.incidents.findIndex(
        (i) => i.id === req.body.incident.id
      );
      if (index !== -1) {
        testData.incidents[index] = {
          ...testData.incidents[index],
          description: req.body.incident.description,
          added_date: req.body.incident.added_date,
          is_solved: req.body.incident.is_solved,
        };
      }
      return testData;
    });

    (mariadbService.executeTransaction as jest.Mock).mockImplementation(
      async (callback: any) => {
        await callback();
        return testData;
      }
    );

    await incidentController.updateIncident(req, res);

    const updated = testData.incidents.find((i) => i.id === 1);
    expect(updated?.description).toBe(
      "Projecteur réparé, fonctionne normalement"
    );
    expect(updated?.is_solved).toBe(1);

    const incidents = res.json.mock.calls[0][0]["incidents"];
    expect(incidents.length).toBe(2);

    expect(res.json).toHaveBeenCalledWith(testData);
    expect(mariadbService.executeTransaction).toHaveBeenCalled();
  });
});

describe("deleteIncidentById", () => {
  it("devrait supprimer un incident et retourner la liste mise à jour", async () => {
    const req: any = {
      params: { id: "1" },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (incidentService.fetchIncidents as jest.Mock).mockImplementation(() => {
      testData.incidents = testData.incidents.filter(
        (incident) => incident.id !== 1
      );
      return testData;
    });

    (mariadbService.executeTransaction as jest.Mock).mockImplementation(
      async (callback: any) => {
        await callback();
        return testData;
      }
    );

    await incidentController.deleteIncidentById(req, res);

    expect(mariadbService.query).toHaveBeenCalledWith(
      `DELETE FROM incident WHERE id = ?`,
      ["1"]
    );
    expect(res.json).toHaveBeenCalledWith(testData);
    expect(testData.incidents.length).toBe(1);
    expect(testData.incidents.find((i) => i.id === 1)).toBeUndefined();
  });

  it("devrait retourner une erreur 500 en cas d'échec", async () => {
    const req: any = {
      params: { id: "99" },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    const error = new Error("Suppression échouée");

    (mariadbService.executeTransaction as jest.Mock).mockRejectedValue(error);

    await incidentController.deleteIncidentById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur lors de la suppression de l'incident",
      error: "Suppression échouée",
    });
  });
});

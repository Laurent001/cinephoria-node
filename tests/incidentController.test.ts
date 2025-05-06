import * as incidentController from "../src/api/controllers/incidentController.js";
import * as incidentService from "../src/services/incident.service.js";
import * as mariadbService from "../src/services/mariadb.service.js";
import { FakeDataType } from "../src/types/fake.js";

declare module "../src/services/mariadb.service" {
  export const executeTransaction: jest.Mock;
  export const query: jest.Mock;
}

jest.mock("../src/services/mariadb.service", () => ({
  executeTransaction: jest.fn(),
  query: jest.fn(),
}));

jest.mock("../src/services/incident.service", () => ({
  fetchIncidents: jest.fn(),
}));

const fakeData: FakeDataType = {
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
  it("ajoute un incident et retourne les incidents à jour", async () => {
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
      testData.incidents.push({
        id: 3,
        description: "Problème de son",
        added_date: "2024-11-16T10:45:00.000Z",
        is_solved: 0,
        material: testData.materials[0],
        auditorium: testData.incidents[1].auditorium,
      });
      return testData;
    });

    (mariadbService.executeTransaction as jest.Mock).mockImplementation(
      async (callback: any) => {
        await callback();
        return testData;
      }
    );

    await incidentController.addIncident(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        incidents: expect.arrayContaining([
          expect.objectContaining({ id: 3, description: "Problème de son" }),
        ]),
      })
    );

    expect(res.json).toHaveBeenCalledWith(testData);
    expect(mariadbService.executeTransaction).toHaveBeenCalled();
  });

  it("retourne une erreur 400 si material.id ou auditorium.id est manquant", async () => {
    const req: any = {
      body: {
        description: "Incident sans données complètes",
        is_solved: false,
        material: {},
        auditorium: {},
      },
    };
    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await incidentController.addIncident(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Champs requis manquants",
    });
  });
});

describe("getIncidents", () => {
  it("retourne les incidents si succès", async () => {
    const req: any = {};
    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (incidentService.fetchIncidents as jest.Mock).mockResolvedValueOnce(
      testData
    );

    await incidentController.getIncidents(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        incidents: expect.any(Array),
        auditoriums: expect.any(Array),
        materials: expect.any(Array),
      })
    );

    expect(res.status).not.toHaveBeenCalled();
  });

  it("retourne une erreur 500 si fetchIncidents échoue", async () => {
    const req: any = {};
    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (incidentService.fetchIncidents as jest.Mock).mockRejectedValue(
      new Error("Échec")
    );

    await incidentController.getIncidents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur lors de la récupération des incidents",
      error: "Échec",
    });
  });
});

describe("updateIncident", () => {
  it("met à jour un incident et retourne la liste", async () => {
    const req: any = {
      body: {
        locale: "Europe/Paris",
        incident: {
          id: 1,
          description: "Réparé",
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
      const i = testData.incidents.findIndex((i) => i.id === 1);
      testData.incidents[i] = {
        ...testData.incidents[i],
        ...req.body.incident,
      };
      return testData;
    });

    (mariadbService.executeTransaction as jest.Mock).mockImplementation(
      async (callback: any) => {
        await callback();
        return testData;
      }
    );

    await incidentController.updateIncident(req, res);

    expect(res.json).toHaveBeenCalledWith(testData);
    expect(mariadbService.executeTransaction).toHaveBeenCalled();
  });

  it("retourne les données inchangées si l'incident à mettre à jour est introuvable", async () => {
    const req: any = {
      body: {
        locale: "Europe/Paris",
        incident: {
          id: 999,
          description: "Inexistant",
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
      return testData;
    });

    (mariadbService.executeTransaction as jest.Mock).mockImplementation(
      async (callback: any) => {
        await callback();
        return testData;
      }
    );

    await incidentController.updateIncident(req, res);

    expect(res.json).toHaveBeenCalledWith(testData);
  });
});

describe("deleteIncidentById", () => {
  it("supprime un incident et retourne les incidents mis à jour", async () => {
    const req: any = { params: { id: "1" } };
    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (incidentService.fetchIncidents as jest.Mock).mockImplementation(() => {
      testData.incidents = testData.incidents.filter((i) => i.id !== 1);
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
    expect(testData.incidents.find((i) => i.id === 1)).toBeUndefined();
  });

  it("retourne une erreur 500 si la suppression échoue", async () => {
    const req: any = { params: { id: "99" } };
    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (mariadbService.executeTransaction as jest.Mock).mockRejectedValue(
      new Error("Suppression échouée")
    );

    await incidentController.deleteIncidentById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur lors de la suppression de l'incident",
      error: "Suppression échouée",
    });
  });

  it("retourne une erreur 500 si l'identifiant est manquant", async () => {
    const req: any = { params: { id: undefined } };
    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await incidentController.deleteIncidentById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur lors de la suppression de l'incident",
      error: expect.any(String),
    });
  });
});

describe("Test d'intégration avec addIncident et getIncidents", () => {
  it("ajoute un incident et le récupère avec getIncidents", async () => {
    const reqAdd: any = {
      body: {
        description: "Problème de son",
        is_solved: false,
        material: { id: 1 },
        auditorium: { id: 2 },
      },
    };

    const resAdd: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (incidentService.fetchIncidents as jest.Mock).mockImplementation(() => {
      testData.incidents.push({
        id: 3,
        description: "Problème de son",
        added_date: "2024-11-16T10:45:00.000Z",
        is_solved: 0,
        material: testData.materials[0],
        auditorium: testData.incidents[1].auditorium,
      });
      return testData;
    });

    (mariadbService.executeTransaction as jest.Mock).mockImplementation(
      async (callback: any) => {
        await callback();
        return testData;
      }
    );

    await incidentController.addIncident(reqAdd, resAdd);

    expect(resAdd.json).toHaveBeenCalledWith(
      expect.objectContaining({
        incidents: expect.arrayContaining([
          expect.objectContaining({ description: "Problème de son" }),
        ]),
      })
    );

    expect(mariadbService.executeTransaction).toHaveBeenCalled();

    const reqGet: any = {};
    const resGet: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    (incidentService.fetchIncidents as jest.Mock).mockResolvedValueOnce(
      testData
    );

    await incidentController.getIncidents(reqGet, resGet);

    expect(resGet.json).toHaveBeenCalledWith(
      expect.objectContaining({
        incidents: expect.any(Array),
        auditoriums: expect.any(Array),
        materials: expect.any(Array),
      })
    );

    expect(resGet.status).not.toHaveBeenCalled();
  });
});

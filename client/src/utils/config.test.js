describe("API base URL configuration", () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
    delete process.env.REACT_APP_API_URL;
    delete process.env.REACT_APP_API;
    jest.resetModules();
  });

  it("defaults to a relative /api path in local development", () => {
    global.window = {
      location: {
        origin: "http://localhost:3001",
        hostname: "localhost",
      },
    };

    const { API_BASE_URL } = require("./config");

    expect(API_BASE_URL).toBe("/api");
  });
});

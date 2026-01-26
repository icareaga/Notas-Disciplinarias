# 🧪 Guía de Testing

## Filosofía de Testing

Este proyecto sigue la pirámide de testing:
```
           /\
          /  \   E2E Tests (Pocos, lentos, alta confianza)
         /____\
        /      \  Integration Tests (Algunos, medianos)
       /________\
      /          \ Unit Tests (Muchos, rápidos, baja confianza)
     /____________\
```

---

## 🚀 Ejecutar Tests

### **Todos los tests:**
```bash
npm test
```

### **Tests con coverage:**
```bash
ng test --code-coverage

# Ver reporte en: coverage/index.html
```

### **Tests en modo watch (desarrollo):**
```bash
ng test --watch
```

### **Tests específicos:**
```bash
# Un solo archivo
ng test --include='**/auth.service.spec.ts'

# Por patrón
ng test --include='**/services/**/*.spec.ts'
```

### **Tests sin browser (headless):**
```bash
ng test --browsers=ChromeHeadless --watch=false
```

---

## 📝 Escribir Tests

### **1️⃣ Unit Tests - Servicios**

#### Ejemplo: AuthService

```typescript
// auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('getToken', () => {
    it('debe retornar null si no hay token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('debe retornar el token si existe', () => {
      const mockToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJJZCI6MTIzNDV9.abc123';
      localStorage.setItem('token', mockToken);
      
      expect(service.getToken()).toBe(mockToken);
    });
  });

  describe('getTokenInfo', () => {
    it('debe decodificar JWT correctamente', () => {
      // JWT que decodifica a: { Id: 12345, Nombre: "Test" }
      const mockToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJJZCI6MTIzNDUsIk5vbWJyZSI6IlRlc3QifQ.signature';
      localStorage.setItem('token', mockToken);
      
      const info = service.getTokenInfo();
      
      expect(info).toBeTruthy();
      expect(info?.Id).toBe(12345);
      expect(info?.Nombre).toBe('Test');
    });

    it('debe normalizar campos del token', () => {
      // Token con UserId en lugar de Id
      const mockToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJVc2VySWQiOjk5OX0.signature';
      localStorage.setItem('token', mockToken);
      
      const info = service.getTokenInfo();
      
      // Debe normalizar UserId -> Id
      expect(info?.Id).toBe(999);
    });

    it('debe retornar null si no hay token', () => {
      expect(service.getTokenInfo()).toBeNull();
    });

    it('debe retornar null si el token es inválido', () => {
      localStorage.setItem('token', 'token-invalido');
      
      expect(service.getTokenInfo()).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('debe retornar true si el token expiró', () => {
      // Token con exp en el pasado
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // Hace 1 hora
      const expiredToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOiR7cGFzdFRpbWVzdGFtcH19.signature`;
      localStorage.setItem('token', expiredToken);
      
      expect(service.isTokenExpired()).toBe(true);
    });

    it('debe retornar false si el token es válido', () => {
      // Token con exp en el futuro
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // En 1 hora
      const validToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOiR7ZnV0dXJlVGltZXN0YW1wfX0.signature`;
      localStorage.setItem('token', validToken);
      
      expect(service.isTokenExpired()).toBe(false);
    });
  });

  describe('logout', () => {
    it('debe limpiar localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('usuario', '{"id":123}');
      
      service.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('usuario')).toBeNull();
    });
  });
});
```

---

### **2️⃣ Unit Tests - Componentes**

#### Ejemplo: LoginComponent

```typescript
// login.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Crear mocks de servicios
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getToken',
      'getTokenInfo',
      'logout'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe cargar datos del usuario si hay token', () => {
      const mockToken = 'valid-token';
      const mockUserData = {
        Id: 123,
        Nombre_Completo: 'Test User',
        Rol: 'admin'
      };

      mockAuthService.getToken.and.returnValue(mockToken);
      mockAuthService.getTokenInfo.and.returnValue(mockUserData);

      component.ngOnInit();

      expect(component.isLoggedIn).toBe(true);
      expect(component.usuarioData).toEqual(mockUserData);
    });

    it('debe mostrar estado no autenticado si no hay token', () => {
      mockAuthService.getToken.and.returnValue(null);

      component.ngOnInit();

      expect(component.isLoggedIn).toBe(false);
      expect(component.usuarioData).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('debe retornar true si el rol es admin', () => {
      component.usuarioData = { Rol: 'admin' } as any;
      
      expect(component.isAdmin()).toBe(true);
    });

    it('debe retornar false si el rol no es admin', () => {
      component.usuarioData = { Rol: 'empleado' } as any;
      
      expect(component.isAdmin()).toBe(false);
    });
  });

  describe('abrirNotas', () => {
    it('debe navegar a senalar-problema', () => {
      component.abrirNotas();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/senalar-problema']);
    });
  });

  describe('verNotas', () => {
    it('debe navegar a usuario', () => {
      component.verNotas();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/usuario']);
    });
  });

  describe('logout', () => {
    it('debe llamar al servicio de logout y limpiar estado', () => {
      component.isLoggedIn = true;
      component.usuarioData = { Id: 123 } as any;

      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(component.isLoggedIn).toBe(false);
      expect(component.usuarioData).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
```

---

### **3️⃣ Integration Tests - HTTP**

#### Ejemplo: CasosService con HTTP

```typescript
// casos.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CasosService } from './casos.service';
import { environment } from '../../environments/environment';

describe('CasosService (Integration)', () => {
  let service: CasosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CasosService]
    });
    service = TestBed.inject(CasosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no hay requests pendientes
  });

  describe('crearCaso', () => {
    it('debe enviar POST con datos correctos', () => {
      const mockCaso = {
        idUsuario: 101,
        idCategoria: 5,
        descripcion: 'Test',
        impacto: 'Test',
        conducta: 'Test',
        idUsuarioJefe: 12345
      };

      const mockResponse = {
        id: 999,
        mensaje: 'Caso creado exitosamente'
      };

      service.crearCaso(mockCaso).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/Casos/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.IdUsuario).toBe(101);
      expect(req.request.body.id_categoria).toBe(5);

      req.flush(mockResponse);
    });

    it('debe manejar errores del servidor', () => {
      const mockCaso = {
        idUsuario: 101,
        idCategoria: 5,
        descripcion: 'Test',
        impacto: 'Test',
        conducta: 'Test'
      };

      service.crearCaso(mockCaso).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual({ message: 'Datos inválidos' });
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/Casos/crear`);
      req.flush({ message: 'Datos inválidos' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('obtenerCasos', () => {
    it('debe retornar lista de casos', () => {
      const mockCasos = [
        { id_caso: 1, categoria: 'Retardo', estatus: 1 },
        { id_caso: 2, categoria: 'Falta', estatus: 1 }
      ];

      service.obtenerCasos(12345).subscribe(casos => {
        expect(casos.length).toBe(2);
        expect(casos[0].id_caso).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/casos-activos?idJefe=12345`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCasos);
    });
  });
});
```

---

## 🎯 Cobertura de Código

### **Objetivo:**
- **Servicios:** 80%+ cobertura
- **Componentes:** 70%+ cobertura
- **Total:** 75%+ cobertura

### **Ver Reporte:**
```bash
ng test --code-coverage --watch=false
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

### **Interpretación:**
```
Statements   : 85.5% ( 234/274 )  ← Líneas ejecutadas
Branches     : 75.2% ( 88/117 )   ← If/else cubiertos
Functions    : 80.1% ( 65/81 )    ← Funciones llamadas
Lines        : 84.8% ( 226/267 )  ← Líneas totales
```

---

## ✅ Buenas Prácticas

### **1. Arrange-Act-Assert (AAA)**
```typescript
it('debe hacer algo', () => {
  // Arrange: Preparar
  const input = 'test';
  const expected = 'TEST';
  
  // Act: Ejecutar
  const result = service.transform(input);
  
  // Assert: Verificar
  expect(result).toBe(expected);
});
```

### **2. Nombres descriptivos**
```typescript
// ✅ BUENO
it('debe retornar error 401 cuando el token es inválido', () => {});

// ❌ MALO
it('test 1', () => {});
```

### **3. Un concepto por test**
```typescript
// ✅ BUENO: Tests separados
it('debe validar email formato correcto', () => {});
it('debe validar email no vacío', () => {});

// ❌ MALO: Todo junto
it('debe validar email', () => {
  // valida formato
  // valida vacío
  // valida longitud
});
```

### **4. Usar mocks para dependencias**
```typescript
// ✅ BUENO: Mock del servicio HTTP
const mockHttp = jasmine.createSpyObj('HttpClient', ['get', 'post']);

// ❌ MALO: Usar servicio real (hace llamadas HTTP reales)
```

### **5. Limpiar después de cada test**
```typescript
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  fixture.destroy();
});
```

---

## 🔧 Configuración

### **karma.conf.js**
```javascript
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage')
    ],
    client: {
      jasmine: {
        random: false // Tests en orden predecible
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```

---

## 🚨 Troubleshooting

### **Error: "Can't resolve 'jsPDF'"**
```bash
npm install --save-dev @types/jspdf
```

### **Error: "localStorage is not defined"**
```typescript
// En setup de test
global.localStorage = {
  getItem: jasmine.createSpy(),
  setItem: jasmine.createSpy(),
  clear: jasmine.createSpy()
} as any;
```

### **Tests muy lentos**
```bash
# Ejecutar en modo headless
ng test --browsers=ChromeHeadless
```

---

## 📊 CI/CD Integration

### **GitHub Actions**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install
        run: npm ci
      - name: Test
        run: npm run test:ci
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### **Script en package.json**
```json
{
  "scripts": {
    "test:ci": "ng test --watch=false --code-coverage --browsers=ChromeHeadless"
  }
}
```

---

¡Tests felices! 🧪✨

# Aplikācijas Piegādes un Uzstādīšanas Instrukcija

Šis dokuments apraksta soļus, kas nepieciešami aplikācijas darbināšanai klienta vidē.

## Sistēmas Prasības
Pirms uzstādīšanas pārliecinieties, ka ir instalēti šādi rīki:
- **PostgreSQL 15+** (Datubāze)
- **Java JDK 17+** (Backend darbināšanai)
- **Node.js 18+** un **npm** (Frontend darbināšanai)
- **Maven 3.8+** (Projektu būvēšanai)

---

## 1. Datubāzes Sagatavošana (Visiem vides tipiem)

Pirms aplikācijas palaišanas nepieciešams izveidot datubāzi un tabulu struktūru.

1. Atveriet **DBeaver** vai `psql` termināli.
2. Izveidojiet jaunu datubāzi: `brick-calculator`.
3. Izpildiet šādu SQL skriptu, lai izveidotu nepieciešamo tabulu:

```sql
CREATE TABLE building_cases (
    id SERIAL PRIMARY KEY,
    objekta_adrese VARCHAR(255) NOT NULL,
    sienas_platums_mm INTEGER NOT NULL,
    sienas_augstums_mm INTEGER NOT NULL,
    bloka_augstums_mm INTEGER DEFAULT 200,
    bloka_garums_mm INTEGER DEFAULT 600,
    bloka_platums_mm INTEGER DEFAULT 300,
    bloka_suves_nobide_mm INTEGER DEFAULT 100,
    bloku_skaits INTEGER DEFAULT 0,
    loga_platums_mm INTEGER DEFAULT 0,
    loga_augstums_mm INTEGER DEFAULT 0,
    loga_x_mm INTEGER DEFAULT 0,
    loga_y_mm INTEGER DEFAULT 0
);
```

---

## 2. Izstrādes Vide (Development Environment)

Paredzēta programmētājiem, lai veiktu izmaiņas kodā ar "Hot-Reload" atbalstu.

### A. Backend (Spring Boot)
1. Navigējiet uz backend mapi: `cd backend`.
2. Failā `src/main/resources/application.properties` konfigurējiet datubāzes piekļuvi:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/brick-calculator
   spring.datasource.username=JŪSU_USER
   spring.datasource.password=JŪSU_PAROLE
   ```
3. Palaidiet backend serveri:
   ```bash
   mvn spring-boot:run
   ```
   *Serveris darbosies uz: `http://localhost:8080`*

### B. Frontend (Vite + React)
1. Navigējiet uz frontend mapi: `cd frontend`.
2. Izveidojiet `.env` failu saknes mapē:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
3. Instalējiet atkarības un palaidiet:
   ```bash
   npm install
   npm run dev
   ```
   *Aplikācija darbosies uz: `http://localhost:5173`*

---

## 3. Lietotāja/Testa Vide (User/Test Environment)

Paredzēta galalietotājam vai testēšanai. Šajā vidē aplikācija tiek kompilēta optimālam ātrumam.

### A. Backend (JAR izveide)
1. Terminālī navigējiet uz backend mapi.
2. Sagatavojiet izpildāmo failu:
   ```bash
   mvn clean package -DskipTests
   ```
3. Rezultātā mapē `target/` tiks izveidots fails `backend-0.0.1.jar`.
4. Palaidiet to:
   ```bash
   java -jar target/backend-0.0.1.jar
   ```

### B. Frontend (Production Build)
1. Navigējiet uz frontend mapi.
2. Veiciet aplikācijas būvēšanu:
   ```bash
   npm run build
   ```
3. Rezultātā tiks izveidota mape `dist/`.
4. Šīs mapes saturu nepieciešams hostēt uz statiskā failu servera (piemēram, **Nginx**, **Apache**) vai ātrai testēšanai izmantojot `serve` pakotni:
   ```bash
   npx serve -s dist
   ```
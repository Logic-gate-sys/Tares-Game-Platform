# System Overview 

## The overall system works to synchronise game state, player stats and global rankings as well as merchs

```mermaid
flowchart TD
    PROXY["Reverse Proxy / NGINX"]

    USER["User Service<br/>(Node.js / TS)<br/>──────────────────────<br/>• Auth & Tokens<br/>• Profiles & Avatars<br/>• Player Stats<br/>• Global Leaderboards"]

    WSS["WSS Service<br/>(Go)<br/>──────────────────────<br/>• WS Room Engine<br/>• Matchmaking<br/>• Game State Loop<br/>• Real-Time Moves"]

    MERCH["Merch Service<br/>(Node.js / TS)<br/>──────────────────────<br/>• Product Catalog<br/>• Cart & Checkout<br/>• Payment Webhooks<br/>• Order Tracking"]

    DB_USER[("user_db<br/>(PostgreSQL)")]
    DB_GAME[("game_db<br/>(Postgres + Redis)")]
    DB_MERCH[("merch_db<br/>(PostgreSQL)")]

    PROXY -->|"HTTP (REST)"| USER
    PROXY -->|"WebSockets (WSS)"| WSS
    PROXY -->|"HTTP (REST)"| MERCH

    USER --> DB_USER
    WSS --> DB_GAME
    MERCH --> DB_MERCH
  ```

  ## Database Architecture & Data Ownership
  
  The platform decouples data storage across three independent microservices. Hard SQL foreign keys (`REFERENCES`) are strictly maintained **within** service boundaries, while cross-service entity associations rely on **Logical Identifiers** (`user_id`).
  
  ### Service Boundary Summary1. 
  user_microservice (PostgreSQL)
  Domain Ownership: Identity, authentication, global profile styling, and aggregate career metrics.
  #### Entities:
  * users: Primary record store (id, email, password_hash, username, p_level, rank, bio, total_score, avatar_url, bg_class, created_at, last_login)
  * tokens: Session and refresh tokens (token_hash, user_id $\rightarrow$ FK to users.id, expiry, scope).

  ### 2. wss_microservice (PostgreSQL + Redis)

  Domain Ownership: Real-time game room coordination, gameplay session history, and match scoring.
  #### Entities:
  * rooms: Room metadata (id, owner_id [Logical], name, capacity, status, icon, styling properties, timestamps).room_players: Active room participants (room_id $\rightarrow$ FK to rooms.id, user_id [Logical], joined_at)
  * game_sessions: In-game state snapshots (id, room_id $\rightarrow$ FK to rooms.id, state [JSONB], status, started_at, ended_at)
  * scores: Per-match scores (game_id $\rightarrow$ FK to game_sessions.id, user_id [Logical], score)
  * In-Memory Store (Redis): Manages transient WebSocket client connections, real-time room states, and MATCH_COMPLETED event publishing.

  ### 3. merch_microservice (MongoDB)

  Domain Ownership: Product catalog, order processing, and active shopping carts.
  #### Collections:
  * products: Physical merch and digital artifact catalog (sku, name, category, priceInCents, stockQuantity, dynamic attributes).
  * orders: Order history (userId [Logical], embedded items array with historical price snapshots, totalAmountInCents, paymentStatus, shippingAddress).
  * carts: Shopping carts (userId [Logical], items, updatedAt).
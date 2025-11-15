# Viewesta Backend API Endpoints

Base URL: `http://localhost:3000/api/v1`

---
## Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Current user profile (auth) |
| PUT | `/auth/profile` | Update profile (auth) |
| PUT | `/auth/change-password` | Change password (auth) |
| POST | `/auth/request-verify` | Send verification email |
| POST | `/auth/verify` | Verify email token |
| POST | `/auth/request-reset` | Request password reset |
| POST | `/auth/reset` | Reset password |

---
## Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/movies` | List movies (`status`, `category_id`, `search`, `limit`, `offset`, `sort_by`, `order`) |
| GET | `/movies/featured` | Featured movies |
| GET | `/movies/trending` | Trending movies |
| GET | `/movies/:id` | Movie details |
| POST | `/movies` | Create movie (filmmaker/admin) |
| PUT | `/movies/:id` | Update movie (owner/admin) |
| DELETE | `/movies/:id` | Delete movie (owner/admin) |

### Movie Pricing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/movies/:movieId/pricing` | Get pricing |
| POST | `/movies/:movieId/pricing` | Set pricing (owner/admin) |
| PUT | `/movies/:movieId/pricing/:quality` | Update pricing (owner/admin) |
| DELETE | `/movies/:movieId/pricing/:quality` | Delete pricing (owner/admin) |

### Movie Video Files
| Method | Endpoint |
|--------|----------|
| GET | `/movies/:movieId/video-files` |
| POST | `/movies/:movieId/video-files` (owner/admin) |
| PUT | `/movies/:movieId/video-files/:fileId` (owner/admin) |
| DELETE | `/movies/:movieId/video-files/:fileId` (owner/admin) |

### Reviews
| Method | Endpoint |
|--------|----------|
| GET | `/movies/:movieId/reviews` |
| POST | `/movies/:movieId/reviews` (auth) |
| GET | `/movies/:movieId/reviews/my-review` (auth) |
| DELETE | `/movies/:movieId/reviews/:reviewId` (auth) |

---
## Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories |
| GET | `/categories/:id` | Category details + movie count |
| POST | `/categories` | Create category (admin) |
| PUT | `/categories/:id` | Update category (admin) |
| DELETE | `/categories/:id` | Delete category (admin) |

---
## Watchlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/watchlist` | Get watchlist (auth) |
| POST | `/watchlist/:movieId` | Add movie (auth) |
| DELETE | `/watchlist/:movieId` | Remove movie (auth) |
| GET | `/watchlist/:movieId/check` | Check if movie is in watchlist |

## Favorites
| Method | Endpoint |
|--------|----------|
| GET | `/favorites` |
| POST | `/favorites/:movieId` |
| DELETE | `/favorites/:movieId` |
| GET | `/favorites/:movieId/check` |

## Watch History
| Method | Endpoint |
|--------|----------|
| GET | `/watch-history` |
| GET | `/watch-history/continue-watching` |
| PUT | `/watch-history/:movieId` |
| DELETE | `/watch-history/:movieId` |

---
## Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet` | Get wallet balance (auth) |
| POST | `/wallet/topup` | Top up wallet (auth) |
| GET | `/wallet/transactions` | Get transaction history (auth) |
| PUT | `/wallet/currency` | Update wallet currency (auth) |

---
## Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/purchase` | Purchase movie (TVOD) (auth) |
| POST | `/payments/verify` | Verify payment transaction (auth) |
| GET | `/payments/purchases` | Get my purchases (auth) |

---
## Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/subscriptions/plans` | Get subscription plans (public) |
| POST | `/subscriptions/subscribe` | Subscribe to plan (auth) |
| GET | `/subscriptions/me` | Get my subscription (auth) |
| PUT | `/subscriptions/:subscription_id/cancel` | Cancel subscription (auth) |
| PUT | `/subscriptions/:subscription_id/auto-renew` | Update auto-renew setting (auth) |

---
## Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/flutterwave` | Flutterwave payment webhook |
| POST | `/webhooks/stripe` | Stripe payment webhook |

---
## Health Check
| Method | Endpoint |
|--------|----------|
| GET | `/health` | 
---

All protected routes require `Authorization: Bearer <token>`.


# Documentation

### \*\*_Below is some ideating and research I transferred from my working Google Doc_

### Database Research / Planning

For this project, I learnt that a relational database, such as SQL cannot store a list of cards inside a cell. I’m sure I learnt it before but re-learning it required me to subsequently re-think my database design. This idea of what a database should and shouldn't have is called **_First Normal Form_** (1NF) and it is a fundamental principle in the designing of databases, ensuring that a database table is structured clearly so that data can be queried and managed without ambiguity. These requirements include:

- Atomic (Indivisible) Values, meaning each cell in the table must hold a single, indivisible value, meaning **no lists**, **arrays**, or **comma-separated values** inside a single column. ← note the bold values, what I evidently forgot
- You cannot have multiple columns representing the same type of data (e.g., Phone1, Phone2, Phone3). Instead, items that repeat are moved into a separate child table.
- All data values within a specific column must belong to the same data type. Self-explanatory really but a nominalisation requirement nonetheless
- Every column in the table must have a distinct name
- Every record/row must be unique and identifiable, typically via a primary key

For my Pokemon collection tracker, I looked at two types of DB relationships commonly discussed in the functions topic of Mathematics, being One to Many and Many to Many.

**One to Many** is the fact users can have multiple binders, so the child must store the parent’s ID.

```sql
users:   id, username, email, password_hash
binders: binder_id, user_id →users.id, name, colour, symbol
```

Therefore, the ‘Array’ I wanted to include in the main list is irrelevant as it is directly linked to the Binders table using the foreign key of the User ID. Hence to get someone’s binders you only have to query

```sql
WHERE user_id = ?
```

**Many to Many** is how a binder, of which users can have _multiple_ of, can have _multiple_ cards from a variety of sets in each binder. However, one card can sit in many binders, as users can own multiple copies of one, thus the relationship has to go both ways cleanly. I can do this with a third table:

```sql
binder_cards: binder_id →binders, card_id →cards, quantity, condition, notes, added_at
```

While ideating, another issue arose in terms of the key functionality required for this task, being offline functionality. When disconnected, the user cannot make any API pulls to retrieve their card data, nor can they lookup and add new cards. Another (larger) table can help to stop this, being a ‘cards’ table.

**The ‘cards’ table**  
Apart from the obvious driver for this being offline functionality, it’s also _required_ for what I want to do for this project. SQL can only query what's in SQLite, so things like filtering by rarity, sorting by HP, joining to a binder, grouping by set and more: none of those are even possible without downloading everything first from an API and doing the work in JavaScript, which is counter-intuitive if the app were to be purely online functional. So instead, the API is used purely as a build-time data source to populate and update my tables, and not used as APIs typically are as a runtime dependency, which thankfully makes offline functionality pretty much seamless aside from. Not sure if it's worth mentioning, but this also reduces the requests required across an average user’s experience :)

```sql
cards: card_id (PK, TEXT), set_id →sets.set_id, name, local_id,
       rarity, hp, illustrator, image_stem,
       market_price, price_currency, price_updated
```

Importantly to note in this table, is card_id is **not** a primary key, but rather a unique set identifier established by TCGdex plus the card’s name. TCGdex gives an id like `swsh7-215` and `base1-4`, so there is no point adding a new key to a system that already has one. In this way, also, every row traces back to the API, and re-running the main seed script updates the existing rows. Solving a problem I didn’t even know existed until doing this 😀

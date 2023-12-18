use anchor_lang::prelude::*;

declare_id!("XCEGtQtTDaAjiK68qagRqikQVUoeVqQNh7ZmfKcwfa1");

#[program]
pub mod mmcm_confession {
    use super::*;

    pub fn send_confession(ctx: Context<SendConfession>, content: String) -> Result<()> {
        let confession: &mut Account<Confession> = &mut ctx.accounts.confession;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        require!(content.chars().count() <= 500, ErrorCode::ContentTooLong);

        confession.author = *author.key;
        confession.timestamp = clock.unix_timestamp;
        confession.content = content;

        Ok(())
    }

    pub fn add_react(ctx: Context<React>) -> Result<()> {
        let confession: &mut Account<Confession> = &mut ctx.accounts.confession;

        confession.reaction_count += 1;

        Ok(())
    }

    pub fn remove_react(ctx: Context<React>) -> Result<()> {
        let confession: &mut Account<Confession> = &mut ctx.accounts.confession;

        confession.reaction_count -= 1;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendConfession<'info> {
    #[account(init, payer = author, space = Confession::LEN)]
    pub confession: Account<'info, Confession>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct React<'info> {
    #[account(mut)]
    pub confession: Account<'info, Confession>,
    pub author: Signer<'info>,
}

#[account]
pub struct Confession {
    pub author: Pubkey,
    pub timestamp: i64,
    pub content: String,
    pub reaction_count: u64,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 8; // Stores the size of the string.
const MAX_CONTENT_LENGTH: usize = 500 * 4; // 500 chars max.
const REACTION_THING: usize = 16;
impl Confession {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH // Content
        + REACTION_THING;
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided content should be 500 characters long maximum.")]
    ContentTooLong,
}
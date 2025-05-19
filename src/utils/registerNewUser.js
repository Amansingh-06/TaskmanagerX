import { supabase } from '../supabaseClient';

export async function registerNewUser(userId, name, mobile) {
    const referrerId = localStorage.getItem('referrer_id');
    console.log("📦 Retrieved referrer ID from localStorage:", referrerId);

    let validReferrerId = null;

    // 🔍 Check if the referrer exists
    if (referrerId) {
        const { data: refUser, error: refError } = await supabase
            .from('users')
            .select('id')
            .eq('id', referrerId)
            .maybeSingle();

        if (refError) {
            console.warn("⚠️ Referrer lookup error:", refError.message);
        }

        if (refUser && refUser.id) {
            validReferrerId = refUser.id;
            console.log("✅ Valid referrer found:", validReferrerId);
        } else {
            console.warn("⚠️ Referrer not found in users table.");
        }
    }

    // 👤 Insert new user
    const { error: userInsertError } = await supabase.from('users').insert([
        {
            id: userId,
            name,
            phone: mobile,
            referrer_id: validReferrerId,
        },
    ]);

    if (userInsertError) {
        console.error("❌ Error inserting new user:", userInsertError.message);
        throw userInsertError;
    }

    console.log("✅ User inserted successfully.");

    // 🎁 Handle referral and reward
    if (validReferrerId) {
        const { error: referralError } = await supabase.from('referrals').insert([
            {
                referrer_id: validReferrerId,
                referred_user_id: userId,
                reward_given: true,
            },
        ]);

        if (referralError) {
            console.warn("⚠️ Error inserting referral:", referralError.message);
        } else {
            console.log("✅ Referral entry added.");
        }

        // 🪙 Reward the referrer
        console.log("🎯 Calling RPC: give_reward_to_referrer with", {
            ref_id: validReferrerId,
            points: 10,
        });

        const { data, error: rewardError } = await supabase.rpc('give_reward_to_referrer', {
            ref_id: validReferrerId,
            points: 10,
        });

        if (rewardError) {
            console.warn("⚠️ Error rewarding referrer:", rewardError.message);
        } else {
            console.log("📬 RPC Response:", data);
            console.log("🎉 Reward given to referrer successfully.");
        }
    }
}

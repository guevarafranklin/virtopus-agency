<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractRequest;
use App\Http\Requests\UpdateContractRequest;
use App\Models\Contract;
use Inertia\Inertia;
use App\Models\Work;
use App\Models\User;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $contracts = Contract::with(['work.user', 'user'])->get();
        
        return Inertia::render('admin/contract/Index', [
            'contracts' => $contracts
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get only works that don't have any contracts assigned yet
        $availableWorks = Work::with('user')
            ->whereDoesntHave('contracts')
            ->where('status', 'active')
            ->get();
            
        $users = User::where('role', 'freelancer')->get();
        
        return Inertia::render('admin/contract/Create', [
            'works' => $availableWorks,
            'users' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContractRequest $request)
    {
        $validated = $request->validate([
            'agency_rate' => 'required|numeric|min:0|max:100',
            'work_id' => 'required|exists:works,id',
            'user_id' => 'required|exists:users,id',
        ]);

        // Check if work already has a contract
        $existingContract = Contract::where('work_id', $validated['work_id'])->first();
        if ($existingContract) {
            return back()->withErrors([
                'work_id' => 'This job already has a freelancer assigned.'
            ]);
        }

        // Check if the freelancer is available (optional - you can remove this if needed)
        $freelancerActiveContracts = Contract::where('user_id', $validated['user_id'])
            ->whereHas('work', function($query) {
                $query->where('status', 'active');
            })
            ->count();

        // Optional: Limit freelancer to X active contracts
        if ($freelancerActiveContracts >= 5) { // Adjust this number as needed
            return back()->withErrors([
                'user_id' => 'This freelancer already has the maximum number of active contracts.'
            ]);
        }

        Contract::create($validated);

        return redirect()->route('admin.contract.index')
            ->with('success', 'Contract created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Contract $contract)
    {
        $contract->load(['work.user', 'user']);
        
        return Inertia::render('admin/contract/Show', [
            'contract' => $contract
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Contract $contract)
    {
        // For editing, show the current work plus other available works
        $availableWorks = Work::with('user')
            ->where(function($query) use ($contract) {
                $query->whereDoesntHave('contracts')
                      ->orWhere('id', $contract->work_id);
            })
            ->where('status', 'active')
            ->get();
            
        $users = User::where('role', 'freelancer')->get();
        $contract->load(['work.user', 'user']);
        
        return Inertia::render('admin/contract/Edit', [
            'contract' => $contract,
            'works' => $availableWorks,
            'users' => $users
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateContractRequest $request, Contract $contract)
    {
        $validated = $request->validate([
            'agency_rate' => 'required|numeric|min:0|max:100',
            'work_id' => 'required|exists:works,id',
            'user_id' => 'required|exists:users,id',
        ]);

        // Check if trying to assign to a work that already has a different contract
        if ($validated['work_id'] !== $contract->work_id) {
            $existingContract = Contract::where('work_id', $validated['work_id'])
                ->where('id', '!=', $contract->id)
                ->first();
            
            if ($existingContract) {
                return back()->withErrors([
                    'work_id' => 'This job already has a freelancer assigned.'
                ]);
            }
        }

        $contract->update($validated);

        return redirect()->route('admin.contract.index')
            ->with('success', 'Contract updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contract $contract)
    {
        $contract->delete();

        return redirect()->route('admin.contract.index')
            ->with('success', 'Contract deleted successfully.');
    }

    /**
     * Display contracts for the authenticated freelancer.
     */
    public function freelancerIndex()
    {
        $contracts = Contract::with(['work.user', 'user'])
            ->where('user_id', auth()->id())
            ->get();
        
        return Inertia::render('freelancer/contract/Index', [
            'contracts' => $contracts
        ]);
    }

    /**
     * Show contract details for freelancer.
     */
    public function freelancerShow(Contract $contract)
    {
        // Ensure the contract belongs to the authenticated freelancer
        if ($contract->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $contract->load(['work.user', 'user']);
        
        return Inertia::render('freelancer/contract/Show', [
            'contract' => $contract
        ]);
    }
}

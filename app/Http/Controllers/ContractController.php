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
        $contracts = Contract::with(['work', 'user'])->get();
        
        return Inertia::render('admin/contract/Index', [
            'contracts' => $contracts
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $works = Work::all();
        $users = User::where('role', 'freelancer')->get(); // Only freelancers can have contracts
        
        return Inertia::render('admin/contract/Create', [
            'works' => $works,
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

        Contract::create($validated);

        return redirect()->route('admin.contract.index')
            ->with('success', 'Contract created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Contract $contract)
    {
    
         $contract->load(['work', 'user']);
        
        return Inertia::render('admin/contract/Show', [
            'contract' => $contract
        ]);
    
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Contract $contract)
    {
        $works = Work::all();
        $users = User::where('role', 'freelancer')->get();
        $contract->load(['work', 'user']);
        
        return Inertia::render('admin/contract/Edit', [
            'contract' => $contract,
            'works' => $works,
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
        $contracts = Contract::with(['work', 'user'])
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

        $contract->load(['work', 'user']);
        
        return Inertia::render('freelancer/contract/Show', [
            'contract' => $contract
        ]);
    }
}
